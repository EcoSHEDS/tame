<template>
  <svg v-if="scheme"></svg>
</template>

<script>
import * as d3 from 'd3'

import { colorSchemes } from '@/constants'

export default {
  name: 'ColorBar',
  props: {
    id: {
      type: String,
      required: true
    },
    scheme: {
      type: String,
      required: false,
      default: 'Viridis',
      validator (value) {
        return colorSchemes.includes(value)
      }
    },
    invert: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: 500
    },
    height: {
      type: Number,
      default: 30
    },
    variable: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      svg: null
    }
  },
  computed: {
    colorScheme () {
      return this.scheme
    },
    colorInvert () {
      return this.invert
    },
    valueScale () {
      console.log('tame-color-bar:valueScale', this.variable)
      const domain = this.variable ? this.variable.domain : [0, 1]
      return d3.scaleLinear()
        .domain(domain)
        .range([0, 1])
        .clamp(true)
    },
    colorScale () {
      console.log('tame-color-bar:colorScale', this.variable)
      let scale
      if (this.variable && this.variable.type === 'continuous') {
        scale = d3.scaleSequential(d3[`interpolate${this.colorScheme}`])
      } else {
        alert('Error! Color bar variable is missing or invalid (must be continuous)')
        scale = (x) => '#AAAAAA'
      }
      return scale
    }
  },
  mounted () {
    this.svg = d3.select(this.$el)
      .attr('width', this.width)
      .attr('height', this.height)

    this.render()
  },
  watch: {
    colorScale () {
      this.render()
    }
  },
  methods: {
    render () {
      this.clear()
      const defs = this.svg.append('defs')

      const linearGradient = defs.append('linearGradient')
        .attr('id', `linear-gradient-${this.id}`)

      linearGradient
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%')

      this.svg.append('rect')
        .attr('width', this.width)
        .attr('height', this.height)
        // .attr('x', this.margins.left)
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
    clear () {
      this.svg.select('defs').remove()
      this.svg.selectAll('rect').remove()
    }
  }
}
</script>
