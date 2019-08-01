<template>
  <div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'TameLegendColorDiscrete',
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
      width: 218,
      itemRadius: 8,
      itemPadding: 10,
      margins: {
        left: 10,
        right: 20,
        top: 0,
        bottom: 0
      },
      colorScheme: 'Viridis'
    }
  },
  computed: {
    domain () {
      return this.variable ? this.variable.domain : []
    },
    height () {
      return this.domain.length * (this.itemRadius * 2 + this.itemPadding) + this.margins.top + this.margins.bottom
    },
    colorScale () {
      // console.log('tame-legend-color-discrete:colorScale', this.variable)
      let scale
      if (this.variable && this.variable.type === 'discrete') {
        scale = d3.scaleOrdinal(d3.schemeCategory10)
          .domain(this.domain)
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
      // console.log('tame-legend-color-discrete:render()', this.variable)
      this.clear()
      this.renderColor()
    },
    renderColor () {
      if (!(this.variable && this.variable.type === 'discrete')) return
      // console.log('tame-legend-color-discrete:renderColor()', this.variable)

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
        .attr('class', 'tame-legend-color-discrete-item')

      items.append('circle')
        .attr('cx', this.itemRadius)
        .attr('cy', (d, i) => this.itemRadius + (this.itemRadius * 2 + this.itemPadding) * i)
        .attr('r', this.itemRadius)
        .attr('fill', (d) => {
          return this.colorScale(d)
        })

      items.append('text')
        .attr('x', this.itemRadius * 2 + 10)
        .attr('y', (d, i) => this.itemRadius + (this.itemRadius * 2 + this.itemPadding) * i)
        .attr('dy', '0.35em')
        .text(d => d)
    },
    clear () {
      // console.log('tame-legend-color-discrete:clear()', this.svg)
      this.svg && this.svg.remove()
    }
  }
}
</script>

<style>
/* .tame-legend-color-discrete-item text {
  fill: rgba(0, 0, 0, 0.54);
} */

/* .tame-legend-color-continuous g.tick > text {
  fill: black;
  font-size: larger;
} */

</style>
