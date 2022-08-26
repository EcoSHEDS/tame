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
    opacityUnselected: {
      type: Number,
      required: false,
      default: 0.3
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
      if (this.data.length === 0) return null

      const lonExtent = d3.extent(this.data.map(d => d[this.project.columns.longitude]))
      const latExtent = d3.extent(this.data.map(d => d[this.project.columns.latitude]))
      return [lonExtent, latExtent] // [[xmin, xmax], [ymin, ymax]]
    }
  },
  mounted () {
    evt.$on('map:render', this.render)
    evt.$on('map:render:filter', this.renderFiltered)

    this.tip.html(d => `
      <strong>Tag ID: ${d[this.project.columns.id]}</strong><br>
      Latitude: ${d[this.project.columns.latitude].toFixed(4)}<br>
      Longitude: ${d[this.project.columns.longitude].toFixed(4)}<br>
      Date/Time: ${this.$moment.utc(d[this.project.columns.datetime]).format('MMM DD, YYYY hh:mm a')}<br>
      Time to Next: ${isNaN(d.$duration) ? 'N/A' : d.$duration.toFixed(2)} days<br>
      Distance to Next: ${isNaN(d.$distance) ? 'N/A' : d.$distance.toFixed(1)} m<br>
      Velocity to Next: ${isNaN(d.$velocity) ? 'N/A' : d.$velocity.toFixed(1)} m/day<br>
      Bearing to Next: ${isNaN(d.$bearing) ? 'N/A' : d.$bearing.toFixed(0)} degrees<br>
    `)

    this.container = this.svg.select('g')
    this.container.call(this.tip)

    if (this.data) {
      this.fitBounds()
      this.render()
    }
  },
  beforeDestroy () {
    evt.$off('map:render', this.render)
    evt.$off('map:render:filter', this.renderFiltered)
    this.tip.destroy()
  },
  watch: {
    data () {
      this.fitBounds()
    },
    selectedIds () {
      this.renderFiltered()
    },
    opacityUnselected () {
      this.renderOpacity()
    }
  },
  methods: {
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
      let data = this.data
      if (!this.project) {
        data = []
      }

      const nestedData = d3.nest()
        .key(d => d[this.project.columns.id])
        .sortValues((a, b) => a[this.project.columns.datetime].valueOf() - b[this.project.columns.datetime].valueOf())
        .entries(data)

      const vm = this
      const tip = this.tip

      const groups = this.container
        .selectAll('g')
        .data(nestedData, d => d.key)
        .join(
          enter => enter
            .append('g')
            .classed('group', true),
          update => update,
          exit => exit.remove()
        )

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
          !vm.disableClick && vm.$emit('click', d[vm.project.columns.id])
          this.parentNode.parentNode.appendChild(this.parentNode) // move to front
        })
        .on('mouseenter', function (d) {
          this.parentNode.parentNode.appendChild(this.parentNode)
          d3.select(this)
            .attr('r', d => vm.zoomLevel * vm.getSize(d) * 2)
          d3.select(this.parentNode)
            .classed('highlight', true)
            .select('path')
            .classed('hidden', false)
          tip.show(d, this)
        })
        .on('mouseout', function (d) {
          d3.select(this)
            .attr('r', d => vm.zoomLevel * vm.getSize(d))
          d3.select(this.parentNode)
            .classed('highlight', false)
            .select('path')
            .classed('hidden', !(vm.selectedIds.length > 0 && vm.selectedIds.includes(d[vm.project.columns.id])))
          tip.hide(d, this)
        })

      this.renderFiltered()
    },
    renderPaths () {
      const line = d3.line()
        .x(d => this.projectPoint(d)[0])
        .y(d => this.projectPoint(d)[1])

      const groups = this.container.selectAll('g')

      groups.selectAll('path')
        .data(d => [d.values.filter(v => xf.isElementFiltered(v.$index))])
        .join(
          enter => enter.append('path'),
          update => update,
          exit => exit.remove()
        )
        .attr('d', line)
        .classed('hidden', true)
    },
    renderFiltered () {
      this.container
        .selectAll('circle')
        .style('display', d => xf.isElementFiltered(d.$index) ? 'inline' : 'none')

      this.renderPaths()
      this.renderSelected()
    },
    renderSelected () {
      if (this.selectedIds.length > 0) {
        const selectedIds = this.selectedIds
        this.container
          .selectAll('g.group')
          .each(function (d) {
            const isSelected = selectedIds.includes(d.key)
            d3.select(this)
              .classed('selected', d => isSelected)
              .classed('unselected', d => !isSelected)
              .select('path')
              .classed('hidden', d => !isSelected)
          })
        this.renderOpacity()
      } else {
        this.container
          .selectAll('g.group')
          .classed('selected', false)
          .classed('unselected', false)
          .style('opacity', null)
          .select('path')
          .classed('hidden', true)
      }
    },
    renderOpacity () {
      this.container
        .selectAll('g.group')
        .style('opacity', null)
      this.container
        .selectAll('g.group.unselected')
        .style('opacity', this.opacityUnselected)
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
g.group.highlight:not(.selected) {
  opacity: 0.75;
}
g.group.highlight path {
  stroke: white;
  stroke-width: 5px;
}

g.group.selected {
  opacity: 1;
}
g.group.selected path {
  stroke: orangered;
  stroke-width: 5px;
}

.d3-tip {
  line-height: 1;
  padding: 10px;
  background: rgba(255, 255, 255, 0.5);
  color: #000;
  border-radius: 2px;
  pointer-events: none;
  font-family: sans-serif;
  z-index: 1000;
  margin-left: 20px;
}
</style>
