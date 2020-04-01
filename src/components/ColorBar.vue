<template>
  <svg v-if="scheme"></svg>
</template>

<script>
import * as d3 from 'd3'

import { generateColorScale } from '@/lib/colors'

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
      default: 'Viridis'
    },
    invert: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'continuous',
      required: true
    },
    width: {
      type: Number,
      default: 500
    },
    height: {
      type: Number,
      default: 30
    }
  },
  data () {
    return {
      svg: null
    }
  },
  computed: {
    colorScale () {
      // console.log('TameColorBar:colorScale', this.type, this.scheme, this.invert)
      return generateColorScale(this.type, this.scheme, this.invert)
    }
  },
  mounted () {
    this.svg = d3.select(this.$el)
      .attr('width', this.width)
      .attr('height', this.height)

    this.render()
  },
  watch: {
    type () {
      this.render()
    },
    scheme () {
      this.render()
    },
    invert () {
      this.render()
    }
  },
  methods: {
    render () {
      this.clear()
      if (this.type === 'continuous') {
        this.renderContinuous()
      } else {
        this.renderDiscrete()
      }
    },
    renderContinuous () {
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
    renderDiscrete () {
      const n = 9
      const values = d3.range(n)

      this.svg.selectAll('rect')
        .data(values, d => d)
        .enter()
        .append('rect')
        .attr('width', this.width / n)
        .attr('height', this.height)
        .attr('x', (d) => d * this.width / n)
        .attr('fill', this.colorScale)
    },
    clear () {
      this.svg.select('defs').remove()
      this.svg.selectAll('rect').remove()
    }
  }
}
</script>
