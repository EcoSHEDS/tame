<template>
  <div class="tame-discrete-color-legend">
    <div ref="svgContainer"></div>
    <div class="subheading ml-3 mb-4" v-if="variable.domain.length > maxCount">
      ... and {{ variable.domain.length - 10 }} more
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { mapGetters } from 'vuex'

export default {
  name: 'DiscreteColorLegend',
  components: {
  },
  data () {
    return {
      id: 'legend-color',
      maxCount: 10,
      svg: null,
      width: 218,
      itemRadius: 8,
      itemPadding: 10,
      margins: {
        left: 10,
        right: 20,
        top: 0,
        bottom: 0
      }
    }
  },
  computed: {
    ...mapGetters({
      scale: 'colorScale',
      variable: 'colorVariable'
    }),
    domain () {
      return this.variable ? this.variable.domain.slice(0, this.maxCount) : []
    },
    height () {
      return this.domain.length * (this.itemRadius * 2 + this.itemPadding) + this.margins.top + this.margins.bottom - 10
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
      console.log('DiscreteColorLegend:render()')
      this.clear()

      this.svg = d3.select(this.$refs.svgContainer)
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
          return this.scale(d)
        })

      items.append('text')
        .attr('x', this.itemRadius * 2 + 10)
        .attr('y', (d, i) => this.itemRadius + (this.itemRadius * 2 + this.itemPadding) * i)
        .attr('dy', '0.35em')
        .text(d => d)
    },
    clear () {
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
