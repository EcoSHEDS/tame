<script>
import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import * as L from 'leaflet'

import evt from '@/events'
import { xf } from '@/crossfilter'

export default {
  name: 'TameMapLayer',
  props: {
    data: {
      type: Array,
      required: false,
      default: () => []
    },
    getColor: {
      type: Function,
      required: false,
      default: (d) => 'gray'
    },
    getOutline: {
      type: Function,
      required: false,
      default: (d) => 'white'
    },
    getSize: {
      type: Function,
      required: false,
      default: (d) => 'gray'
    },
    selectedId: {
      type: String,
      required: false
    },
    showLines: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      container: null,
      tip: d3Tip()
        .attr('class', 'd3-tip')
        .direction('e')
    }
  },
  computed: {
    map () {
      return this.$parent.map
    },
    overlay () {
      return this.$parent.overlay
    },
    disableClick () {
      return this.$parent.disableClick
    },
    zoomLevel () {
      return this.$parent.zoomLevel
    },
    boundingBox () {
      // console.log('tame-map-layer:boundingBox')
      if (this.data.length === 0) return null

      const lonExtent = d3.extent(this.data.map(d => d.lon))
      const latExtent = d3.extent(this.data.map(d => d.lat))
      return [lonExtent, latExtent] // [[xmin, xmax], [ymin, ymax]]
    },
    nestedData () {
      return d3.nest()
        .key(d => d.uid)
        .sortValues((a, b) => a.datetime.valueOf() - b.datetime.valueOf())
        .entries(this.data)
    }
  },
  mounted () {
    evt.$on('map:zoom', this.resize)
    evt.$on('map:render', this.render)
    evt.$on('map:render:filter', this.renderFilter)

    this.tip.html(d => `
      <strong>Tag ID: ${d.uid}</strong><br>
      Latitude: ${d.lat.toFixed(4)}<br>
      Longitude: ${d.lon.toFixed(4)}<br>
      Date/Time: ${this.$moment.utc(d.datetime).format('MMM DD, YYYY hh:mm a')}<br>
      Season: ${d.season}<br>
      Length: ${d.length}<br>
      Cohort: ${d.cohort}<br>
      Active: ${d.active}<br>
    `)

    this.container = this.overlay.append('g')
    this.container.call(this.tip)
    this.resize()

    if (this.data) {
      this.resize()
      this.fitBounds()
    }
  },
  beforeDestroy () {
    evt.$off('map:zoom', this.resize)
    evt.$off('map:render', this.render)
    evt.$off('map:render:filter', this.renderFilter)
    this.tip.destroy()
    this.container.selectAll('*').remove()
    this.container.remove()
  },
  watch: {
    data () {
      this.resize()
      this.fitBounds()
    },
    selectedId () {
      console.log('tame-map-layer:watch(selectedId)', this.selectedId)
      this.renderSelected()
    },
    showLines () {
      this.render()
    }
  },
  methods: {
    resize () {
      if (!this.boundingBox) return

      const topLeft = {
        lon: this.boundingBox[0][0],
        lat: this.boundingBox[1][0]
      }
      const bottomRight = {
        lon: this.boundingBox[0][1],
        lat: this.boundingBox[1][1]
      }
      const bounds = [topLeft, bottomRight]

      const projectedBounds = bounds.map(this.projectPoint)

      this.$parent.$emit('resize', projectedBounds)
      this.render()
    },
    fitBounds () {
      if (!this.boundingBox) return

      const bounds = [
        [this.boundingBox[1][0], this.boundingBox[0][0]], // bottomleft
        [this.boundingBox[1][1], this.boundingBox[0][1]] // topright
      ]
      this.map.fitBounds(bounds)
    },
    projectPoint (d) {
      const latLng = new L.LatLng(d.lat, d.lon)
      const point = this.map.latLngToLayerPoint(latLng)
      return [point.x, point.y]
    },
    render () {
      // console.log('tame-map-layer:render')
      if (!this.data) return

      const vm = this
      const tip = this.tip

      this.container
        .selectAll('g')
        .remove()

      const groups = this.container
        .selectAll('g')
        .data(this.nestedData, d => d.key)
        .enter()
        .append('g')
        .classed('group', true)

      const line = d3.line()
        .x(d => this.projectPoint(d)[0])
        .y(d => this.projectPoint(d)[1])

      groups.append('path')
        .datum(d => d.values, d => d.key)
        .attr('d', line)
        .classed('hidden', !this.showLines)

      groups.selectAll('circle')
        .data(d => d.values, d => d.$index)
        .enter()
        .append('circle')
        .on('click', function (d) {
          console.log('click', this.selectedId, d.uid)
          let id
          if (vm.selectedId === d.uid) {
            id = null
          } else {
            id = d.uid
          }
          !vm.disableClick && vm.$emit('click', id)
          this.parentNode.parentNode.appendChild(this.parentNode) // move to front
        })
        .on('mouseenter', function (d) {
          this.parentNode.parentNode.appendChild(this.parentNode)
          d3.select(this.parentNode)
            .classed('highlight', true)
            .select('path')
            .classed('hidden', false)
          tip.show(d, this)
        })
        .on('mouseout', function (d) {
          d3.select(this.parentNode)
            .classed('highlight', false)
            .select('path')
            .classed('hidden', !(vm.selectedId && d.uid === vm.selectedId) && !vm.showLines)
          tip.hide(d, this)
        })
        .attr('r', d => this.zoomLevel * this.getSize(d))
        .style('fill', this.getColor)
        .style('stroke', this.getOutline)
        .each(function (d, i) {
          const point = vm.projectPoint(d)
          d3.select(this)
            .attr('cx', d => point[0])
            .attr('cy', d => point[1])
        })
      this.renderSelected()
    },
    renderFilter () {
      // console.log('tame-map-layer:renderFilter')
      this.container
        .selectAll('g')
        .selectAll('circle')
        .style('display', d => xf.isElementFiltered(d.$index) ? 'inline' : 'none')
        // .style('fill', d => xf.isElementFiltered(d.$index) ? this.getColor(d) : 'none')
    },
    renderSelected () {
      console.log('tame-map-layer:renderSelected()', this.selectedId)
      this.container
        .selectAll('g')
        .classed('selected', d => this.selectedId && d.key === this.selectedId)
        .classed('unselected', d => this.selectedId && d.key !== this.selectedId)
        .select('path')
        .classed('hidden', d => !(this.selectedId && d.key === this.selectedId) && !this.showLines)
        // .select('path')
        // .classed('hidden', false)
    }
  },
  render: function (h) {
    return null
  }
}
</script>

<style>
g.group {
  opacity: 0.7;
}
g.group path {
  stroke-width: 1.5px;
  fill: none;
  stroke: grey;
  opacity: 0.5;
}
g.group path.hidden {
  display: none;
}
g.group.highlight {
  opacity: 1;
}
g.group.highlight path {
  stroke: white;
  stroke-width: 5px;
}
g.group.selected {
  opacity: 1;
}
g.group.unselected {
  opacity: 0.2;
}
g.group.highlight:not(.selected) {
  opacity: 0.75;
}
g.group.selected path {
  stroke: orangered;
  stroke-width: 5px;
}
</style>
