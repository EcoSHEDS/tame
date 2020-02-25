<template>
  <div>
    <div class="my-2 font-weight-bold grey--text text--darken-2">
      Outline: <span v-if="variable">{{ variable.name }}</span><span v-else>None</span>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'TameLegendOutline',
  props: {
    variable: {
      type: Object
    }
  },
  data () {
    return {
      svg: null,
      container: null,
      itemRadius: 8,
      itemPadding: 10,
      width: 218,
      margins: {
        left: 10,
        right: 20,
        top: 5,
        bottom: 1
      }
    }
  },
  computed: {
    colorScale () {
      return d3.scaleOrdinal(['orangered', 'white'])
        .domain(this.domain)
    },
    domain () {
      return this.variable ? this.variable.domain : []
    },
    height () {
      return this.domain.length * (this.itemRadius * 2 + this.itemPadding) + this.margins.top + this.margins.bottom
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
      // console.log('tame-legend-outline:render()', this.variable)
      this.clear()
      this.renderSvg()
    },
    renderSvg () {
      if (!(this.variable && this.variable.type === 'discrete')) return
      // console.log('tame-legend-outline:renderSvg()', this.variable)

      this.svg = d3.select(this.$el)
        .append('svg')
        .attr('height', this.height)
        .attr('width', this.width)

      this.container = this.svg
        .append('g')
        .attr('transform', `translate(${this.margins.left}, ${this.margins.top})`)

      const items = this.container.selectAll('g')
        .data(this.domain, d => d)
        .enter()
        .append('g')
        .attr('class', 'tame-legend-outline-item')

      items.append('circle')
        .attr('cx', this.itemRadius)
        .attr('cy', (d, i) => this.itemRadius + (this.itemRadius * 2 + this.itemPadding) * (this.domain.length - i - 1))
        .attr('r', this.itemRadius)
        .attr('fill', '#AAAAAA')
        .attr('stroke', d => this.colorScale(d))
        .attr('stroke-width', '2px')

      items.append('text')
        .attr('x', this.itemRadius * 2 + 10)
        .attr('y', (d, i) => this.itemRadius + (this.itemRadius * 2 + this.itemPadding) * (this.domain.length - i - 1))
        .attr('dy', '0.3em')
        .text(d => d)
    },
    clear () {
      // console.log('tame-legend-outline:clear()', this.svg)
      this.svg && this.svg.remove()
    }
  }
}
</script>
