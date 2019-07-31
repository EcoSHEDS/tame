<template>
  <div class="tame-legend-color-continuous">
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'TameLegendColorContinuous',
  components: {
  },
  props: {
    variable: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      id: 'legend-color',
      svg: null,
      barWidth: 20,
      barHeight: 200,
      axisWidth: 300,
      margins: {
        left: 10,
        right: 20,
        top: 10,
        bottom: 10
      },
      colorScheme: 'Viridis'
    }
  },
  computed: {
    width () {
      return this.barWidth + this.margins.left + this.axisWidth
    },
    height () {
      return this.barHeight + this.margins.top + this.margins.bottom
    },
    colorScale () {
      console.log('tame-legend-color-continuous:colorScale', this.variable)
      let scale
      if (this.variable && this.variable.type === 'continuous') {
        scale = d3.scaleSequential(d3[`interpolate${this.colorScheme}`])
      } else {
        scale = (x) => '#AAAAAA'
      }
      return scale
    }
  },
  watch: {
    variable () {
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
      console.log('tame-legend-color-continuous:render()', this.variable)
      this.clear()
      this.renderColor()
      this.renderAxis()
    },
    renderColor () {
      if (!(this.variable && this.variable.type === 'continuous')) return
      console.log('tame-legend-color-continuous:renderColor()', this.variable)

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
        .attr('stop-color', d => this.colorScale(d))
    },
    renderAxis () {
      if (!(this.variable && this.variable.type === 'continuous')) return
      console.log('tame-legend-color-continuous:renderAxis()', this.variable)

      const container = this.svg.select('g')

      container.append('g')
        .attr('class', 'legend-axis')
        .attr('transform', `translate(${this.barWidth + 0}, 0)`)

      const axisScale = d3.scaleLinear()
        .domain(this.variable.domain)
        .rangeRound([this.barHeight, 0])
        .clamp(true)

      const axis = d3.axisRight(axisScale).ticks(8).tickSize(10)
      this.svg.select('g.legend-axis')
        .call(axis)
    },
    clear () {
      console.log('tame-legend-color-continuous:clear()', this.svg)
      this.svg && this.svg.remove()
    }
  }
}
</script>

<style>
.tame-legend-color-continuous g.tick > text {
  fill: black;
  font-size: larger;
}
</style>
