<template>
  <v-card elevation-1 class="my-4">
    <v-toolbar dense color="grey lighten-3" flat height="32" class="font-weight-bold">
      <span>
        {{ variable.name }}
        <span v-if="variable.type === 'id' && (idFilter.selected.length > 0)">
          ({{ idFilter.selected.length }} ID<span v-if="idFilter.selected.length > 1">s</span>)
        </span>
        <span v-else-if="variable.type === 'continuous' && filterRange.length > 0">
          ({{ filterRange[0] | formatValue }} to {{ filterRange[1] | formatValue }})
        </span>
        <span v-else-if="variable.type === 'discrete' && filterRange.length > 0">
          ({{ filterRange.length }} value<span v-if="filterRange.length > 1">s</span>)
        </span>
        <span v-else-if="variable.type === 'datetime' && filterRange.length > 0">
          ({{ filterRange[0] | moment('add', '1 day') | moment('MM/DD/YYYY') }} to {{ filterRange[1] | moment('MM/DD/YYYY') }})
        </span>
      </span>
      <v-spacer></v-spacer>
      <v-tooltip bottom open-delay="300">
        <template v-slot:activator="{ on }">
          <v-btn small icon @click="resetFilter" v-on="on">
            <v-icon small>mdi-refresh</v-icon>
          </v-btn>
        </template>
        Reset Filter
      </v-tooltip>
      <v-tooltip bottom open-delay="300">
        <template v-slot:activator="{ on }">
          <v-btn small icon @click="hide = !hide" v-on="on">
            <v-icon small v-if="!hide">mdi-menu-up</v-icon>
            <v-icon small v-else>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <span>{{ hide ? 'Show' : 'Minimize' }} Filter</span>
      </v-tooltip>
      <v-tooltip bottom open-delay="300">
        <template v-slot:activator="{ on }">
          <v-btn small icon @click="close" v-on="on">
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </template>
        <span>Close Filter</span>
      </v-tooltip>
    </v-toolbar>
    <v-card-text v-show="!hide" class="pb-1">
      <div v-if="variable.type === 'id'">
        <v-autocomplete
          :items="idFilter.options"
          v-model="idFilter.selected"
          multiple
          dense
          outlined
          item-value="id"
          item-text="id"
          chips
          small-chips
          deletable-chips
          clearable
          hide-details
          @change="onIdFilter"
          label="Select tag ID(s)...">
          <template v-slot:selection="{ item, index }">
            <v-chip close small v-if="index < 10" @click:close="removeIdFilter(item.id)">
              <span>{{ item.id }}</span>
            </v-chip>
            <span
              v-if="index === 10"
              class="grey--text caption"
            >(+{{ idFilter.selected.length - 1 }} more)</span>
          </template>
        </v-autocomplete>
        <div class="text-right mt-2">
          <v-btn small text color="default" @click="useSelected">Use Selected</v-btn>
          <v-tooltip right open-delay="100" max-width="400">
            <template v-slot:activator="{ on }">
              <v-btn small icon v-on="on" class="align-self-center">
                <v-icon small>mdi-alert-circle-outline</v-icon>
              </v-btn>
            </template>
            Filter the dataset for only the selected individuals (if any).
          </v-tooltip>
        </div>
      </div>
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

const valueFormatter = d3.format(',.3r')

export default {
  name: 'TameFilter',
  props: {
    variable: {
      type: Object,
      required: false
    },
    selectedIds: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data () {
    return {
      hide: false,
      filterRange: [],
      idFilter: {
        options: [],
        selected: []
      }
    }
  },
  computed: {
    ...mapGetters(['project'])
  },
  filters: {
    formatValue (v) {
      return valueFormatter(v)
    }
  },
  mounted () {
    // console.log('TameFilter:mounted', this.variable.id)
    const el = this.$el.getElementsByClassName('tame-filter-chart').item(0)
    const variable = this.variable

    if (variable.type === 'id') {
      this.idFilter.dim = xf.dimension(d => d[this.project.columns.id])
      this.idFilter.group = this.idFilter.dim.group().reduceCount()
      this.idFilter.options = this.idFilter.group.all().map(d => ({ id: d.key }))
      return
    } else if (variable.type === 'continuous') {
      const margins = { top: 4, right: 10, bottom: 18, left: 30 }
      const dim = xf.dimension(d => isNaN(d[variable.id]) || d[variable.id] === null ? -Infinity : d[variable.id])
      const l = this.variable.domain[0]
      const u = this.variable.domain[1]
      const n = 30
      const interval = (u - l) / n
      const group = dim.group(d => l + Math.floor((d - l) / interval) * interval).reduceCount()

      this.chart = dc.barChart(el)
        .width(396)
        .height(100)
        .margins(margins)
        .dimension(dim)
        .group(group)
        .elasticY(true)
        .colors('#5095c3')
        .transitionDelay(0)
        .x(d3.scaleLinear().domain([l, u + interval]))
        .yAxisLabel('# Obs')
        .on('filtered', () => {
          // console.log('continuous:filtered')
          // console.log(`tame-filter:on(filtered):${variable.id}`)
          const filter = this.chart.dimension().currentFilter()
          if (filter) {
            this.filterRange = [filter[0], filter[1]]
          } else {
            this.filterRange = []
          }
          evt.$emit('map:render:filter')
          evt.$emit('filter')
        })
      this.chart.xUnits(() => 30)
      if (variable.tickFormat) {
        this.chart.xAxis().tickFormat(d3.format(variable.tickFormat))
      }
      if (variable.tickValues) {
        console.log(Object.keys(variable.tickValues))
        this.chart.xAxis().tickValues(Object.keys(variable.tickValues)).tickFormat(d => variable.tickValues[d])
      }
      this.chart.yAxis().ticks(4, 's')
    } else if (variable.type === 'discrete') {
      const margins = { top: 0, right: 10, bottom: 35, left: 16 }
      const dim = xf.dimension(d => d[variable.id])
      const group = dim.group().reduceCount()
      const count = variable.domain.length
      const gap = 5
      const barHeight = 20
      const height = margins.bottom + barHeight * count + gap * (count + 1)

      this.chart = dc.rowChart(el)
        .width(396)
        .height(height)
        .margins(margins)
        .dimension(dim)
        .group(group)
        .elasticX(true)
        .ordinalColors(d3.range(variable.domain.length).map(d => d3.schemeCategory10[0]))
        .transitionDelay(0)
        .transitionDuration(0)
        .gap(gap)
        .colors('#5095c3')
        .fixedBarHeight(20)
        .ordering(d => variable.domain.findIndex(v => v === d.key))
        .label(function (d) {
          return d.key
        })
        .on('filtered', () => {
          // console.log('discrete:filtered')
          this.filterRange = this.chart.filters()
          evt.$emit('map:render:filter')
          evt.$emit('filter')
        })
        .on('renderlet', (chart) => {
          chart.selectAll('g.row')
            .each(function () {
              const label = chart.select('.axis').select('text.x-axis-label')
              if (label.size() === 0) {
                chart.select('.axis')
                  .append('text')
                  .attr('class', 'x-axis-label')
                  .attr('text-anchor', 'middle')
                  .attr('x', chart.width() * 0.44)
                  .attr('y', 30)
                  .text('# Observations')
              }
            })
        })
      this.chart.xAxis().ticks(4, 'r')
    } else if (variable.type === 'datetime') {
      const margins = { top: 4, right: 10, bottom: 18, left: 30 }

      const timeExtent = d3.extent(xf.all().map(d => d[this.project.columns.datetime]))

      const start = this.$moment(timeExtent[0])
      const end = this.$moment(timeExtent[1])
      const durationDays = this.$moment.duration(end.diff(start)).as('days')

      let interval = d3.utcMonth
      let xUnits = d3.utcMonths
      let label = 'Month'

      if (durationDays < 120) {
        interval = d3.utcDay
        xUnits = d3.utcDays
        label = 'Day'
      } else if (durationDays < (365 * 1.5)) {
        interval = d3.utcWeek
        xUnits = d3.utcWeeks
        label = 'Week'
      }

      const timeExtentInterval = timeExtent.map(interval)

      const dim = xf.dimension(d => d[this.project.columns.datetime])
      const group = dim.group(interval).reduceCount()

      this.filterRange = [
        interval.floor(timeExtentInterval[0]),
        interval.ceil(timeExtentInterval[1])
      ]

      this.chart = dc.barChart(el)
        .width(396)
        .height(100)
        .margins(margins)
        .dimension(dim)
        .group(group)
        .elasticY(true)
        .colors('#5095c3')
        .x(d3.scaleUtc().domain([
          interval.floor(timeExtentInterval[0]),
          interval.offset(interval.ceil(timeExtentInterval[1]), 1)
        ]))
        .xUnits(xUnits)
        .yAxisLabel(`# Obs per ${label}`)
        // .round(d3.utcDay.round)
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
      this.chart.xAxis().ticks(4)
      this.chart.yAxis().ticks(4, 's')
    }
    this.chart.render()
  },
  beforeDestroy () {
    if (this.chart) {
      this.chart.dimension().dispose()
      dc.chartRegistry.deregister(this.chart)
    } else if (this.variable.type === 'id') {
      this.idFilter.dim.dispose()
    }
    dc.renderAll()
    evt.$emit('map:render:filter')
    evt.$emit('filter')
  },
  methods: {
    useSelected () {
      this.idFilter.selected = this.selectedIds.slice()
      this.onIdFilter()
    },
    render () {
      this.chart && this.chart.render()
    },
    resetFilter () {
      // console.log('tame-filter:resetFilter')
      if (this.variable.type === 'id') {
        this.idFilter.selected = []
        this.onIdFilter()
      } else {
        this.chart && this.chart.filterAll()
      }
      dc.redrawAll()
    },
    close () {
      this.$emit('close')
    },
    removeIdFilter (id) {
      console.log('removeIdFilter', id)
      this.idFilter.selected = this.idFilter.selected.filter(d => d !== id)
      this.onIdFilter()
    },
    onIdFilter () {
      // console.log('onIdFilter')
      if (this.idFilter.selected.length === 0) {
        this.idFilter.dim.filterAll()
      } else {
        this.idFilter.dim.filter(d => this.idFilter.selected.includes(d))
      }
      evt.$emit('map:render:filter')
      evt.$emit('filter')
      dc.redrawAll()
    }
  }
}
</script>

<style>
.dc-chart text.y-axis-label.y-label {
  fill: hsl(0, 0%, 20%);
  font-size: 0.8em;
  font-family: sans-serif;
}
.dc-chart rect.bar {
  fill-opacity: 0.8;
}
.dc-chart g.axis > g.tick:not(:nth-child(2)) > line.grid-line {
  display: none;
}
.dc-chart g.row rect {
  fill-opacity: 1;
}
.dc-chart g.row text {
  fill: hsl(0, 0%, 10%) !important;
  font-weight: 400;
}
.dc-chart text.x-axis-label {
  fill: hsl(0, 0%, 20%);
  font-size: 1em;
  font-family: sans-serif;
}
</style>
