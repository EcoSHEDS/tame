<script>
import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import * as L from 'leaflet'

import evt from '@/events'

export default {
  name: 'TameMapLayer',
  props: {
    // name: {
    //   type: String,
    //   required: true
    // },
    data: {
      type: Array,
      required: false,
      default: () => []
    }
    // setBounds: {
    //   type: Boolean,
    //   required: false,
    //   default: false
    // },
    // getFill: {
    //   type: Function,
    //   required: false,
    //   default: () => 'red'
    // },
    // getValue: {
    //   type: Function,
    //   required: false,
    //   default: () => null
    // },
    // selected: {
    //   type: Object,
    //   required: false,
    //   default: null
    // }
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
    pointRadius () {
      return this.zoomLevel - 4
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
    evt.$on('map:render', this.renderFill)

    this.tip.html(d => `
      <strong>Tag ID: ${d.uid}</strong><br>
      Capture Date/Time: ${this.$moment.utc(d.datetime).format('MMM DD, YYYY hh:mm a')}<br>
      Latitude: ${d.lat.toFixed(4)}<br>
      Longitude: ${d.lon.toFixed(4)}<br>
      Length: ${d.length}<br>
      Cohort: ${d.cohort}<br>
      Active: ${d.active === 1 ? 'Yes' : 'No'}<br>
    `)

    this.container = this.overlay.append('g')
    this.container.call(this.tip)
    this.resize()

    if (this.data) {
      this.resize()
      this.fitBounds()
      this.render()
    }
  },
  beforeDestroy () {
    evt.$off('map:zoom', this.resize)
    evt.$off('map:render', this.renderFill)
    this.tip.destroy()
    this.container.selectAll('*').remove()
    this.container.remove()
  },
  watch: {
    data () {
      this.resize()
      this.fitBounds()
    },
    nestedData () {
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
      console.log('tame-map-layer:render')
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
        // .style('stroke', 'gray')

      groups.selectAll('circle')
        .data(d => d.values, d => d.$index)
        .enter()
        .append('circle')
        .on('click', function (d) {
          console.log('click', d)
          // !vm.disableClick && vm.$emit('click', d)
          // this.parentNode.appendChild(this) // move to front
        })
        .on('mouseenter', function (d) {
        //   if (!vm.selected) {
        //     // move to front if nothing selected
        //     this.parentNode.appendChild(this)
        //   } else {
        //     // move to 2nd from front, behind selected
        //     const lastChild = this.parentNode.lastChild
        //     this.parentNode.insertBefore(this, lastChild)
        //   }
          this.parentNode.parentNode.appendChild(this.parentNode)

          d3.select(this.parentNode)
            .classed('highlight', true)
            // .style('opacity', 1)

          // parent.selectAll('circle')
          //   .style('fill', 'orangered')
          // parent.selectAll('path')
          //   .style('stroke', 'orangered')

          // d3.select(this)
          //   .attr('r', vm.pointRadius * 2)

          tip.show(d, this)
        })
        .on('mouseout', function (d) {
          // d3.select(this)
          //   .attr('r', vm.pointRadius)

          // vm.container
          //   .selectAll('circle')
          //   .style('fill', 'gray')
          //   .style('opacity', 0.75)

          d3.select(this.parentNode)
            .classed('highlight', false)

          // d3.select(this.parentNode)
          //   .style('opacity', 0.5)
          //   .selectAll('circle')
          //   .style('fill', 'gray')

          // d3.select(this)
          //   .attr('r', vm.pointRadius)

          tip.hide(d, this)
        })
        .attr('r', this.pointRadius)
        // .style('fill', 'gray')
        // .style('opacity', 0.75)
        .each(function (d) {
          const point = vm.projectPoint(d)
          d3.select(this)
            .attr('cx', d => point[0])
            .attr('cy', d => point[1])
        })

      this.renderFill()
    },
    renderFill () {
      // console.log(`map-layer(${this.name}):renderFill`)
      // this.container
      //   .selectAll('g')
      //   .selectAll('circle')
      // .style('fill', 'gray')
      // .style('display', d => this.getValue(d).count > 0 ? 'inline' : 'none')
    }
    // renderSelected () {
    //   // console.log(`map-layer(${this.name}):renderSelected`)
    //   this.container
    //     .selectAll('circle')
    //     .classed('selected', this.isSelected)
    // },
    // isSelected (feature) {
    //   return !!this.selected && this.selected.id === feature.id
    // }
  },
  render: function (h) {
    return null
  }
}
</script>

<style>
g.group {
  opacity: 0.5;
}
g.group circle {
  fill: gray;
  stroke: white;
}
g.group path {
  stroke: gray;
  stroke-width: 1.5px;
  fill: none;
}
g.group.highlight {
  opacity: 1;
}
g.group.highlight circle {
  fill: orangered;
}
g.group.highlight path {
  stroke: orangered;
  stroke-width: 3px;
}
</style>
