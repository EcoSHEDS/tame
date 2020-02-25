<script>
import { mapGetters } from 'vuex'
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
    selectedIds: {
      type: Array,
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
    ...mapGetters(['project']),
    map () {
      return this.$parent.map
    },
    svg () {
      return this.$parent.svg
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

      const lonExtent = d3.extent(this.data.map(d => d[this.project.columns.longitude]))
      const latExtent = d3.extent(this.data.map(d => d[this.project.columns.latitude]))
      return [lonExtent, latExtent] // [[xmin, xmax], [ymin, ymax]]
    },
    nestedData () {
      return d3.nest()
        .key(d => d[this.project.columns.id])
        .sortValues((a, b) => a[this.project.columns.datetime].valueOf() - b[this.project.columns.datetime].valueOf())
        .entries(this.data)
    }
  },
  mounted () {
    // console.log('tame-map-layer:mounted')
    // evt.$on('map:zoom', this.resize)
    evt.$on('map:render', this.render)
    evt.$on('map:render:filter', this.renderFiltered)

    this.tip.html(d => `
      <strong>Tag ID: ${d[this.project.columns.id]}</strong><br>
      Latitude: ${d[this.project.columns.latitude].toFixed(4)}<br>
      Longitude: ${d[this.project.columns.longitude].toFixed(4)}<br>
      Date/Time: ${this.$moment.utc(d[this.project.columns.datetime]).format('MMM DD, YYYY hh:mm a')}<br>
      Distance to Next (m): ${d.$distance ? d.$distance.toFixed(1) : 'N/A'}<br>
      Time to Next (days): ${d.$duration ? d.$duration.toFixed(1) : 'N/A'}<br>
      Velocity (m/day): ${d.$velocity ? d.$velocity.toFixed(2) : 'N/A'}
    `)

    this.container = this.svg.select('g')
    this.container.call(this.tip)
    // this.resize()

    if (this.data) {
      // this.resize()
      this.fitBounds()
      this.render()
    }
  },
  beforeDestroy () {
    // console.log('tame-map-layer:beforeDestroy')
    // evt.$off('map:zoom', this.resize)
    evt.$off('map:render', this.render)
    evt.$off('map:render:filter', this.renderFiltered)
    this.tip.destroy()
  },
  watch: {
    data () {
      // this.resize()
      this.fitBounds()
    },
    selectedIds () {
      // console.log('tame-map-layer:watch(selectedIds)', this.selectedIds)
      this.renderSelected()
    },
    showLines () {
      this.render()
    }
  },
  methods: {
    // resize () {
    //   if (!this.boundingBox) return

    //   const topLeft = {
    //     lon: this.boundingBox[0][0],
    //     lat: this.boundingBox[1][0]
    //   }
    //   const bottomRight = {
    //     lon: this.boundingBox[0][1],
    //     lat: this.boundingBox[1][1]
    //   }
    //   const bounds = [topLeft, bottomRight]

    //   const projectedBounds = bounds.map(this.projectPoint)

    //   this.$parent.$emit('resize', projectedBounds)
    //   this.render()
    // },
    fitBounds () {
      if (!this.boundingBox) return

      const bounds = [
        [this.boundingBox[1][0], this.boundingBox[0][0] - 0.03], // bottomleft
        [this.boundingBox[1][1], this.boundingBox[0][1] + 0.03] // topright
      ]

      this.map.fitBounds(bounds)
    },
    projectPoint (d) {
      const latLng = new L.LatLng(d[this.project.columns.latitude], d[this.project.columns.longitude])
      const point = this.map.latLngToLayerPoint(latLng)
      return [point.x, point.y]
    },
    render () {
      if (!this.data) return

      const vm = this
      const tip = this.tip

      const line = d3.line()
        .x(d => this.projectPoint(d)[0])
        .y(d => this.projectPoint(d)[1])

      const groups = this.container
        .selectAll('g')
        .data(this.nestedData, d => d.key)
        .join(
          enter => enter
            .append('g')
            .classed('group', true),
          update => update,
          exit => exit.remove()
        )

      groups
        .selectAll('path')
        .data(d => [d.values])
        .join(
          enter => enter.append('path'),
          update => update,
          exit => exit.remove()
        )
        .attr('d', line)
        .classed('hidden', !vm.showLines)

      groups.selectAll('circle')
        .data(d => d.values, d => d.$index)
        .join(
          enter => enter
            .append('circle')
            .attr('class', 'point'),
          update => update,
          exit => exit.remove()
        )
        .attr('r', d => this.zoomLevel * this.getSize(d))
        .style('fill', this.getColor)
        .style('stroke', this.getOutline)
        .each(function (d, i) {
          const point = vm.projectPoint(d)
          d3.select(this)
            .attr('cx', d => point[0])
            .attr('cy', d => point[1])
        })
        .on('click', function (d) {
          // console.log('click', this.selectedIds, d[this.project.columns.id])
          // let id
          // if (vm.selectedIds.includes(d[this.project.columns.id])) {
          //   id = null
          // } else {
          //   id = d[this.project.columns.id]
          // }
          !vm.disableClick && vm.$emit('click', d[vm.project.columns.id])
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
            .classed('hidden', !(vm.selectedIds.length > 0 && vm.selectedIds.includes(d[vm.project.columns.id])) && !vm.showLines)
          tip.hide(d, this)
        })

      this.renderSelected()
      this.renderFiltered()
    },
    renderFiltered () {
      // console.log('tame-map-layer:renderFiltered')
      this.container
        .selectAll('circle')
        .style('display', d => xf.isElementFiltered(d.$index) ? 'inline' : 'none')
    },
    renderSelected () {
      // console.log('tame-map-layer:renderSelected()', this.selectedIds)
      this.container
        .selectAll('g')
        .classed('selected', d => this.selectedIds.length > 0 && this.selectedIds.includes(d.key))
        .classed('unselected', d => this.selectedIds.length > 0 && !this.selectedIds.includes(d.key))
        .select('path')
        .classed('hidden', d => !(this.selectedIds.length > 0 && this.selectedIds.includes(d.key)) && !this.showLines)
    }
  },
  render: function (h) {
    return null
  }
}
</script>

<style>
g.group {
  opacity: 0.9;
}
g.group path {
  stroke-width: 2.5px;
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
  opacity: 0.3;
}
g.group.highlight:not(.selected) {
  opacity: 0.75;
}
g.group.selected path {
  stroke: orangered;
  stroke-width: 5px;
}
</style>
