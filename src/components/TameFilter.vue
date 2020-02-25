<template>
  <v-card elevation-1 class="my-2">
    <v-toolbar dense color="grey lighten-3" flat height="32">
      <strong>
        {{ variable.name }}
        <span v-if="filterRange && variable.type === 'continuous'">
          ({{ filterRange[0].toFixed(1) }} - {{ filterRange[1].toFixed(1) }})
        </span>
        <span v-else-if="filterRange && variable.type === 'datetime'">
          ({{ filterRange[0] | moment('add', '1 day') | moment('MM/DD/YYYY') }} - {{ filterRange[1] | moment('MM/DD/YYYY') }})
        </span>
      </strong>
      <v-spacer></v-spacer>
      <v-tooltip bottom open-delay="300">
        <template v-slot:activator="{ on }">
          <v-btn icon small @click="resetFilter" height="24" width="24" class="grey darken-1 elevation-2 mr-0 ml-2" dark v-on="on">
            <v-icon small>mdi-refresh</v-icon>
          </v-btn>
        </template>
        <span>Reset Filter</span>
      </v-tooltip>
      <v-tooltip bottom open-delay="300">
        <template v-slot:activator="{ on }">
          <v-btn icon small @click="hide = !hide" height="24" width="24" class="grey darken-1 elevation-2 mr-0 ml-2" dark v-on="on">
            <v-icon small v-if="hide">mdi-menu-up</v-icon>
            <v-icon small v-else>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <span>{{ hide ? 'Show' : 'Hide' }} Filter</span>
      </v-tooltip>
      <v-tooltip bottom open-delay="300">
        <template v-slot:activator="{ on }">
          <v-btn icon small @click="close" height="24" width="24" class="grey darken-1 elevation-2 mr-0 ml-2" dark v-on="on">
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </template>
        <span>Remove Filter</span>
      </v-tooltip>
    </v-toolbar>
    <v-card-text v-show="!hide">
      <div class="tame-filter-chart"></div>
    </v-card-text>
  </v-card>
</template>

<script>
import dc from 'dc'
import * as d3 from 'd3'

import evt from '@/events'
import { xf } from '@/crossfilter'
import { mapGetters } from 'vuex'

export default {
  name: 'TameFilter',
  props: {
    variable: {
      type: Object,
      required: false
    }
  },
  data () {
    return {
      hide: false,
      filterRange: null
    }
  },
  computed: {
    ...mapGetters(['project'])
  },
  mounted () {
    const el = this.$el.getElementsByClassName('tame-filter-chart').item(0)
    const margins = { top: 0, right: 20, bottom: 16, left: 30 }
    const variable = this.variable

    if (variable.type === 'continuous') {
      const interval = (variable.domain[1] - variable.domain[0]) / 30
      const dim = xf.dimension(d => d[variable.id])
      const group = dim.group(d => Math.floor(d / interval) * interval).reduceCount()

      this.chart = dc.barChart(el)
        .width(486)
        .height(100)
        .margins(margins)
        .dimension(dim)
        .group(group)
        .elasticY(true)
        .transitionDelay(0)
        .x(d3.scaleLinear().domain(variable.domain))
        .on('filtered', () => {
          // console.log(`tame-filter:on(filtered):${variable.id}`)
          const filter = this.chart.dimension().currentFilter()
          if (filter) {
            this.filterRange = [filter[0], filter[1]]
          } else {
            this.filterRange = undefined
          }
          evt.$emit('map:render:filter')
          evt.$emit('filter')
        })
      this.chart.xUnits(() => 30)
      this.chart.yAxis().ticks(4)
    } else if (variable.type === 'discrete') {
      const dim = xf.dimension(d => d[variable.id])
      const group = dim.group().reduceCount()
      const count = variable.domain.length
      const gap = 5
      const barHeight = 20
      const height = margins.bottom + barHeight * count + gap * (count + 1)

      this.chart = dc.rowChart(el)
        .width(486)
        .height(height)
        .margins(margins)
        .dimension(dim)
        .group(group)
        .elasticX(true)
        .ordinalColors(d3.range(variable.domain.length).map(d => d3.schemeCategory10[0]))
        .transitionDelay(0)
        .transitionDuration(0)
        .gap(gap)
        .fixedBarHeight(20)
        .ordering(d => variable.domain.findIndex(v => v === d.key))
        .label(function (d) {
          return d.key
        })
        .on('filtered', () => {
          evt.$emit('map:render:filter')
          evt.$emit('filter')
        })
        .on('renderlet', (chart) => {
          chart.selectAll('g.row')
            .each(function () {
              const barWidth = +d3.select(this).select('rect').attr('width')
              const textEl = d3.select(this).select('text')
              const textWidth = textEl.node().getBBox().width
              if (barWidth < (10 + textWidth)) {
                textEl
                  .style('fill', 'black')
                  .attr('transform', `translate(${barWidth - 5},0)`)
              } else {
                textEl
                  .style('fill', null)
              }
            })
        })
    } else if (variable.type === 'datetime') {
      const dim = xf.dimension(d => d3.utcDay(d[this.project.columns.datetime]))
      const group = dim.group().reduceCount()
      const timeExtent = d3.extent(xf.all().map(d => d3.utcDay(d[this.project.columns.datetime])))
      timeExtent[1] = this.$moment(timeExtent[1]).add(1, 'day').toDate()
      this.filterRange = timeExtent

      this.chart = dc.barChart(el)
        .width(486)
        .height(100)
        .margins(margins)
        .dimension(dim)
        .group(group)
        .elasticY(true)
        .x(d3.scaleUtc().domain(timeExtent))
        .xUnits(d3.utcDays)
        .round(d3.utcDay.round)
        .on('filtered', () => {
          const filter = this.chart.dimension().currentFilter()
          if (filter) {
            this.filterRange = [filter[0], filter[1]]
          } else {
            this.filterRange = this.chart.x().domain()
          }
          evt.$emit('map:render:filter')
          evt.$emit('filter')
        })
      this.chart.xAxis().ticks(10).tickFormat(d3.utcFormat('%m/%d'))
      this.chart.yAxis().ticks(4)
    }

    this.chart.render()
  },
  beforeDestroy () {
    if (this.chart) {
      this.chart.dimension().dispose()
      dc.chartRegistry.deregister(this.chart)
      dc.renderAll()
    }
    evt.$emit('map:render:filter')
  },
  methods: {
    render () {
      this.chart && this.chart.render()
    },
    resetFilter () {
      // console.log('tame-filter:resetFilter')
      this.chart && this.chart.filterAll()
      dc.redrawAll()
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>

<style>
.dc-chart rect.bar {
  fill-opacity: 0.8;
}
.dc-chart g.axis > g.tick:not(:nth-child(2)) > line.grid-line {
  display: none;
}
</style>
