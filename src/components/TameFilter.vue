<template>
  <v-card elevation-1 class="my-2">
    <v-toolbar dense color="grey lighten-3" flat height="32">
      <strong>{{ variable.description }} <span v-if="variable.units">({{variable.units}})</span></strong>
      <v-spacer></v-spacer>
      <v-btn icon small @click="hide = !hide" height="24" width="24" class="grey darken-1 elevation-2 mr-0 ml-2" dark>
        <v-icon small v-if="hide">mdi-menu-up</v-icon>
        <v-icon small v-else>mdi-menu-down</v-icon>
      </v-btn>
      <v-btn icon small @click="close" height="24" width="24" class="grey darken-1 elevation-2 mr-0 ml-2" dark>
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text v-show="!hide">
      <!-- Filter Range:
      <span v-if="filterRange">{{ filterRange[0].toFixed(1) }} - {{ filterRange[1].toFixed(1) }}</span>
      <span v-else>None</span> -->
      <div class="tame-filter-chart"></div>
    </v-card-text>
  </v-card>
</template>

<script>
import dc from 'dc'
import * as d3 from 'd3'

import evt from '@/events'
import { xf } from '@/crossfilter'

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
  mounted () {
    const interval = (this.variable.domain[1] - this.variable.domain[0]) / 30
    const dim = xf.dimension(d => d[this.variable.id])
    const group = dim.group(d => Math.floor(d / interval) * interval).reduceCount()

    this.chart = dc.barChart(this.$el.getElementsByClassName('tame-filter-chart').item(0))
      .width(500)
      .height(150)
      .margins({ top: 0, right: 20, bottom: 30, left: 30 })
      .dimension(dim)
      .group(group)
      .elasticY(true)
      .transitionDelay(0)
      .x(d3.scaleLinear().domain(this.variable.domain))
      .on('filtered', () => {
        const filter = this.chart.dimension().currentFilter()
        if (filter) {
          this.filterRange = [filter[0], filter[1]]
        } else {
          this.filterRange = undefined
        }
        // evt.$emit('xf:filter')
        // evt.$emit('map:render')
        evt.$emit('map:render:filter')
        evt.$emit('filter')
      })

    this.chart.xUnits(() => 30)

    // this.chart.xAxis()
    // .tickFormat(d => this.axisFormatter(this.inverseTransform(d)))

    this.chart.render()
  },
  beforeDestroy () {
    this.chart.dimension().dispose()
    dc.chartRegistry.deregister(this.chart)
    dc.renderAll()
    evt.$emit('map:render:filter')
  },
  methods: {
    render () {
      this.chart.render()
    },
    resetFilter () {
      this.chart.dimension().filterAll()
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>
