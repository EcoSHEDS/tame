<template>
  <div class="tame-continuous-color-legend">
  </div>
</template>

<script>
import * as d3 from 'd3'
import { mapGetters } from 'vuex'

export default {
  name: 'ContinuousColorLegend',
  data () {
    return {
      id: 'legend-color',
      svg: null,
      barWidth: 20,
      barHeight: 200,
      width: 218,
      margins: {
        left: 10,
        right: 20,
        top: 10,
        bottom: 10
      }
    }
  },
  computed: {
    ...mapGetters({
      scale: 'colorScale',
      variable: 'colorVariable'
    }),
    height () {
      return this.barHeight + this.margins.top + this.margins.bottom
    }
  },
  watch: {
    variable () {
      this.render()
    },
    scale () {
      this.render()
    }
  },
  mounted () {
    this.render()
  },
  beforeDestroy () {
    this.clear()
  },
  methods: {
    render () {
      this.clear()

      if (!(this.variable && this.variable.type === 'continuous')) return

      this.svg = d3.select(this.$el)
        .append('svg')
        .attr('height', this.height)
        .attr('width', this.width)

      const container = this.svg
        .append('g')
        .attr('transform', `translate(${this.margins.left}, ${this.margins.top})`)

      const defs = this.svg.append('defs')

      const linearGradient = defs.append('linearGradient')
        .attr('id', `linear-gradient-${this.id}`)

      linearGradient
        .attr('x1', '0%')
        .attr('y1', '100%')
        .attr('x2', '0%')
        .attr('y2', '0%')

      container.append('rect')
        .attr('width', this.barWidth)
        .attr('height', this.barHeight)
        .attr('x', 0)
        .attr('y', 0)
        .style('fill', `url(#linear-gradient-${this.id}`)

      const delta = 0.2
      const offsets = d3.range(0, 1, delta)
      offsets.push(1)

      linearGradient.selectAll('stop')
        .data(offsets)
        .enter()
        .append('stop')
        .attr('offset', d => d)
        .attr('stop-color', d => this.scale(d))

      container.append('g')
        .attr('class', 'legend-axis')
        .attr('transform', `translate(${this.barWidth + 0}, 0)`)

      const axisScale = d3.scaleLinear()
        .domain(this.variable.domain)
        .rangeRound([this.barHeight, 0])
        .clamp(true)

      const axis = d3.axisRight(axisScale).ticks(8).tickSize(10)

      if (this.variable.tickValues) {
        axis.tickValues(Object.keys(this.variable.tickValues)).tickFormat(d => this.variable.tickValues[d])
      }

      this.svg.select('g.legend-axis')
        .call(axis)
    },
    clear () {
      this.svg && this.svg.remove()
    }
  }
}
</script>

<style>
.tame-continuous-color-legend g.tick > text {
  fill: black;
  font-size: larger;
}
</style>
