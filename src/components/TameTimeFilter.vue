<template>
  <div>
    <!-- <div>
      Range Selected:
      <span v-if="!filterRange">None</span>
      <span v-else>
        {{ filterRange[0] | moment('MM/DD/YYYY') }} to {{ filterRange[1] | moment('MM/DD/YYYY') }}
      </span>
    </div> -->
  </div>
</template>

<script>
import dc from 'dc'
import { xf } from '@/crossfilter'
import * as d3 from 'd3'

import evt from '@/events'

export default {
  name: 'TameTimeFilter',
  data () {
    return {
      filterRange: null
    }
  },
  mounted () {
    // evt.$on('filter', this.render)

    const dim = xf.dimension(d => d3.utcDay(d.datetime))
    const group = dim.group().reduceCount()
    const timeExtent = d3.extent(xf.all().map(d => d3.utcDay(d.datetime)))
    this.filterRange = timeExtent

    this.chart = dc.barChart(this.$el)
      .width(550)
      .height(150)
      .margins({ top: 0, right: 20, bottom: 30, left: 30 })
      .dimension(dim)
      .group(group)
      .elasticY(true)
      .x(d3.scaleTime().domain(timeExtent))
      .xUnits(d3.utcDays)
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

    // this.chart.xUnits(() => 100)

    if (xf.size() > 0) {
      this.render()
    }
    setTimeout(() => {
      this.render()
    }, 1000)
  },
  beforeDestroy () {
    this.chart.dimension().dispose()
    dc.chartRegistry.deregister(this.chart)
    dc.renderAll()
  },
  methods: {
    render () {
      console.log('tame-time-filter:render')
      this.chart && this.chart.render()
    }
  }
}
</script>
