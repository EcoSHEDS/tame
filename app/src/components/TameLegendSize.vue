<template>
  <div>
    <div class="my-2 font-weight-bold grey--text text--darken-2" style="height:28px">
      <div class="pt-1">
        Size: <span v-if="variable">{{ variable.name }}</span><span v-else>None</span>
      </div>
      <v-spacer></v-spacer>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'

import evt from '@/events'

export default {
  name: 'TameLegendSize',
  props: {
    variable: {
      type: Object
    }
  },
  data () {
    return {
      svg: null,
      container: null,
      nItems: 5,
      maxRadius: 10,
      itemPadding: 5,
      width: 218,
      margins: {
        left: 10,
        right: 20,
        top: 5,
        bottom: 5
      }
    }
  },
  computed: {
    sizeScale () {
      return d3.scaleLinear()
        .domain(this.domain)
        .range([0.1, 1])
        .clamp(true)
    },
    ticks () {
      return this.sizeScale.ticks(this.nItems)
    },
    domain () {
      return this.variable ? this.variable.domain : [0, 1]
    },
    height () {
      return this.ticks.length * (this.maxRadius * 1.5 + this.itemPadding) + this.margins.top + this.margins.bottom
    }
  },
  watch: {
    variable () {
      this.render()
    }
  },
  mounted () {
    this.render()
    evt.$on('map:zoom', this.onZoom)
  },
  beforeDestroy () {
    this.clear()
    evt.$off('map:zoom', this.onZoom)
  },
  methods: {
    onZoom (zoom) {
      this.maxRadius = zoom
      this.render()
    },
    render () {
      this.clear()
      this.renderSvg()
    },
    renderSvg () {
      if (!(this.variable && this.variable.type === 'continuous')) return

      this.svg = d3.select(this.$el)
        .append('svg')
        .attr('height', this.height)
        .attr('width', this.width)

      this.container = this.svg
        .append('g')
        .attr('transform', `translate(${this.margins.left}, ${this.margins.top})`)

      const items = this.container.selectAll('g')
        .data(this.ticks, d => d)
        .enter()
        .append('g')
        .attr('class', 'tame-legend-size-item')

      items.append('circle')
        .attr('cx', this.maxRadius)
        .attr('cy', (d, i) => this.maxRadius + (this.maxRadius * 1.5 + this.itemPadding) * (this.ticks.length - i - 1))
        .attr('r', (d) => this.maxRadius * this.sizeScale(d))
        .attr('fill', 'none')
        .attr('stroke', '#777')
        .attr('stroke-width', '2px')

      items.append('text')
        .attr('x', this.maxRadius * 2 + 10)
        .attr('y', (d, i) => this.maxRadius + (this.maxRadius * 1.5 + this.itemPadding) * (this.ticks.length - i - 1))
        .attr('dy', '0.3em')
        .text(d => d)
    },
    clear () {
      this.svg && this.svg.remove()
    }
  }
}
</script>
