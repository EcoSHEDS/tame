<script>
import { mapGetters } from 'vuex'
import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import * as L from 'leaflet'

import evt from '@/events'
import { xf } from '@/crossfilter'

const pickerMap = new Map()
const jitterIdMap = new Map()

export default {
  name: 'TameMapLayerCanvas',
  props: {
    dataset: {
      type: Array,
      required: true
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
    transparency: {
      type: Number,
      required: false,
      default: 0.9
    },
    jitterX: {
      type: Number,
      required: false,
      default: 0
    },
    jitterY: {
      type: Number,
      required: false,
      default: 0
    },
    hoverArrows: {
      type: Boolean,
      required: false,
      default: true
    },
    hoverColor: {
      type: Boolean,
      required: false,
      default: true
    },
    allLines: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      base: {
      },
      overlay: {
      },
      picker: {
      },
      hover: null,
      tip: d3Tip()
        .attr('class', 'd3-tip')
        .direction('e'),
      arrowSize: 15
    }
  },
  computed: {
    ...mapGetters(['project']),
    map () {
      return this.$parent.map
    },
    disableClick () {
      return this.$parent.disableClick
    },
    zoomLevel () {
      return this.$parent.zoomLevel
    },
    boundingBox () {
      // console.log('tame-map-layer:boundingBox')
      if (this.dataset.length === 0) return null

      const lonExtent = d3.extent(this.dataset.map(d => d[this.project.columns.longitude]))
      const latExtent = d3.extent(this.dataset.map(d => d[this.project.columns.latitude]))
      return [lonExtent, latExtent] // [[xmin, xmax], [ymin, ymax]]
    },
    mappedDataset () {
      pickerMap.clear()
      jitterIdMap.clear()

      if (this.dataset.length === 0) return

      // picker color lookup
      this.dataset.forEach(d => {
        pickerMap.set(this.getPickerColor(d.$index).toString(), d)
      })

      // jitter by ID
      const ids = new Set(this.dataset.map(d => d[this.project.columns.id]))
      ids.forEach(id => {
        jitterIdMap.set(id, { x: Math.random(), y: Math.random() })
      })

      return this.dataset
    },
    jitterValues () {
      const n = this.mappedDataset.length
      const bbox = this.boundingBox

      if (n === 0 || !bbox) return []

      const bottomLeft = this.map.latLngToContainerPoint(new L.LatLng(bbox[1][0], bbox[0][1]))
      const topRight = this.map.latLngToContainerPoint(new L.LatLng(bbox[1][1], bbox[0][0]))

      const dX = bottomLeft.x - topRight.x
      const dY = bottomLeft.y - topRight.y
      const dMax = dX > dY ? dX : dY

      // return d3.range(n).map((_, i) => ({
      //   x: Math.round((Math.random() - 0.5) * dMax),
      //   y: Math.round((Math.random() - 0.5) * dMax)
      // }))
      return this.mappedDataset.map(d => ({
        x: Math.round((jitterIdMap.get(d[this.project.columns.id]).x - 0.5) * dMax),
        y: Math.round((jitterIdMap.get(d[this.project.columns.id]).y - 0.5) * dMax)
      }))
    }
  },
  mounted () {
    const formatter = d3.format(',.3r')
    this.tip.html(d => `
      <strong>Tag ID: ${d[this.project.columns.id]}</strong><br>
      Latitude: ${d[this.project.columns.latitude].toFixed(4)}<br>
      Longitude: ${d[this.project.columns.longitude].toFixed(4)}<br>
      Date/Time: ${this.$moment.utc(d[this.project.columns.datetime]).format('MMM DD, YYYY hh:mm a')}<br>
      Time to Next: ${isNaN(d.$duration) || !isFinite(d.$duration) ? 'N/A' : formatter(d.$duration) + ' days'}<br>
      Distance to Next: ${isNaN(d.$distance) || !isFinite(d.$distance) ? 'N/A' : formatter(d.$distance) + ' m'}<br>
      Velocity to Next: ${isNaN(d.$velocity) || !isFinite(d.$velocity) ? 'N/A' : formatter(d.$velocity) + ' m/day'}<br>
      Bearing to Next: ${isNaN(d.$bearing) || !isFinite(d.$bearing) ? 'N/A' : d.$bearing.toFixed(0) + ' degrees'}<br>
    `)

    const size = this.map.getSize()
    const originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin'])

    this.base.canvas = d3.select(document.createElement('canvas'))
      .attr('class', 'leaflet-layer leaflet-zoom-hide tame-canvas-base')
      .style(originProp, '50% 50%')
      .attr('width', size.x)
      .attr('height', size.y)
      .node()
    this.picker.canvas = d3.select(document.createElement('canvas'))
      .attr('class', 'leaflet-layer leaflet-zoom-hide tame-canvas-picker')
      .style(originProp, '50% 50%')
      .attr('width', size.x)
      .attr('height', size.y)
      .node()
    this.overlay.canvas = d3.select(document.createElement('canvas'))
      .attr('class', 'leaflet-layer leaflet-zoom-hide tame-canvas-overlay')
      .style(originProp, '50% 50%')
      .style('pointer-events', 'none')
      .attr('width', size.x)
      .attr('height', size.y)
      .node()

    this.base.context = this.base.canvas.getContext('2d')
    this.picker.context = this.picker.canvas.getContext('2d')
    this.overlay.context = this.overlay.canvas.getContext('2d')

    const vm = this

    d3.select(this.base.canvas).on('mousemove', function () {
      const previousHover = vm.hover

      const xy = d3.mouse(this)
      const color = vm.picker.context.getImageData(xy[0], xy[1], 1, 1).data

      let d
      if (color[3] > 0) {
        d = pickerMap.get(color.slice(0, 3).toString())
        vm.showHover(d)
      } else {
        vm.showHover()
      }

      if (previousHover !== d) vm.renderOverlay()
    })

    d3.select(this.base.canvas).on('click', function () {
      if (vm.disableClick) return
      const xy = d3.mouse(this)
      const color = vm.picker.context.getImageData(xy[0], xy[1], 1, 1).data

      if (color[3] > 0) {
        const d = pickerMap.get(color.slice(0, 3).toString())
        d && vm.$emit('click', d[vm.project.columns.id])
      }
    })

    this.map.getPane('overlayPane').appendChild(this.base.canvas)
    this.map.getPane('overlayPane').appendChild(this.overlay.canvas)
    // this.map.getPane('overlayPane').appendChild(this.picker.canvas)

    const svgLayer = L.svg()
    this.map.addLayer(svgLayer)

    this.svg = d3.select(svgLayer.getPane()).select('svg')
      .classed('leaflet-zoom-animated', false)
      .classed('leaflet-zoom-hide', true)
      .classed('map', true)
      .style('pointer-events', 'none')
      .style('z-index', 201)
    this.svg.select('g').call(this.tip)

    if (this.dataset.length > 0) {
      this.fitBounds()
      this.render()
    }

    this.setTransparency()

    evt.$on('map:render:filter', this.render)
    evt.$on('map:render', this.render)
    evt.$on('map:move', this.render)
  },
  beforeDestroy () {
    evt.$off('map:render:filter', this.render)
    evt.$off('map:render', this.render)
    evt.$off('map:move', this.render)
    this.svg.remove()
    this.base.canvas.remove()
    this.picker.canvas.remove()
    this.overlay.canvas.remove()
    this.tip.destroy()
  },
  watch: {
    project () {
      this.fitBounds()
    },
    selectedIds () {
      this.renderOverlay()
    },
    transparency () {
      this.setTransparency()
    },
    jitterX () {
      this.render()
    },
    jitterY () {
      this.render()
    },
    allLines () {
      this.render()
    }
  },
  methods: {
    showHover (d) {
      this.hover = d

      this.svg.select('g').select('circle').remove()

      if (this.hover) {
        const c = this.project.columns
        const jitter = this.jitterValues[d.$index]
        const latLng = new L.LatLng(d[c.latitude], d[c.longitude])
        const point = this.map.latLngToLayerPoint(latLng)

        const tip = this.tip

        this.svg.select('g')
          .selectAll('circle')
          .data([d], d => d.$index)
          .join(
            enter => enter.append('circle'),
            update => update,
            exit => exit.remove()
          )
          .attr('cx', point.x + jitter.x * Math.pow(this.jitterX, 2))
          .attr('cy', point.y + jitter.y * Math.pow(this.jitterY, 2))
          .attr('r', 0)
          .style('opacity', 0)
          .style('pointer-events', 'none')
          .each(tip.show)
      } else {
        this.tip.hide()
      }
    },
    reset () {
      var topLeft = this.map.containerPointToLayerPoint([0, 0])
      L.DomUtil.setPosition(this.base.canvas, topLeft)
      L.DomUtil.setPosition(this.overlay.canvas, topLeft)
      L.DomUtil.setPosition(this.picker.canvas, topLeft)

      var size = this.map.getSize()

      this.base.canvas.width = size.x
      this.base.canvas.height = size.y
      this.overlay.canvas.width = size.x
      this.overlay.canvas.height = size.y
      this.picker.canvas.width = size.x
      this.picker.canvas.height = size.y
    },
    setTransparency () {
      d3.select(this.base.canvas)
        .style('opacity', this.transparency)
    },
    render () {
      this.renderBase()
      this.renderOverlay()
    },
    renderBase () {
      // console.log('renderBase')
      if (!this.base.context) return

      this.reset()

      this.base.context.clearRect(0, 0, this.base.canvas.width, this.base.canvas.height)
      this.picker.context.clearRect(0, 0, this.picker.canvas.width, this.picker.canvas.height)

      if (!this.project) return

      const data = xf.allFiltered()
      this.base.context.lineWidth = 0.5

      if (this.allLines) {
        const line = d3.line()
          .x(d => this.projectCanvasPoint(d).x)
          .y(d => this.projectCanvasPoint(d).y)
          // .curve(d3.curveCardinal)
          .curve(d3.curveLinear)
          .context(this.base.context)
        const grouped = d3.nest()
          .key(d => d[this.project.columns.id])
          .sortValues((a, b) => a[this.project.columns.datetime].valueOf() - b[this.project.columns.datetime].valueOf())
          .entries(data)
        this.base.context.lineWidth = 2
        const color = d3.color('white')
        color.opacity = 0.5
        this.base.context.strokeStyle = color.formatRgb()

        grouped.forEach(d => {
          this.base.context.beginPath()
          line(d.values)
          this.base.context.stroke()
        })
      }

      data.forEach((d, i) => {
        const point = this.projectCanvasPoint(d)

        const r = this.getSize(d) * 10

        this.base.context.fillStyle = d3.color(this.getColor(d)).formatRgb()
        this.base.context.strokeStyle = d3.color('white').formatRgb()
        this.base.context.beginPath()
        this.base.context.arc(point.x, point.y, r, 0, 2 * Math.PI)
        this.base.context.fill()
        this.base.context.stroke()

        const pickerColor = this.getPickerColor(d.$index)
        this.picker.context.fillStyle = `rgb(${pickerColor})`
        this.picker.context.beginPath()
        this.picker.context.arc(point.x, point.y, r + 2, 0, 2 * Math.PI)
        this.picker.context.fill()
      })
    },
    renderOverlay () {
      // console.log('renderOverlay')
      if (!this.overlay.context) return

      this.overlay.context.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height)

      if (!this.project) return
      const c = this.project.columns
      const line = d3.line()
        .x(d => this.projectCanvasPoint(d).x)
        .y(d => this.projectCanvasPoint(d).y)
        // .curve(d3.curveCardinal)
        .curve(d3.curveLinear)
        .context(this.overlay.context)

      const hoverPoints = this.hover ? xf.allFiltered().filter(d => this.hover[c.id] === d[c.id]) : []
      hoverPoints.sort((a, b) => a[c.datetime].valueOf() - b[c.datetime].valueOf())

      const selectedPoints = this.selectedIds.length > 0 ? xf.allFiltered().filter(d => this.selectedIds.includes(d[c.id])) : []

      // selected path
      if (selectedPoints.length > 0) {
        const selectedPaths = d3.nest()
          .key(d => d[c.id])
          .sortValues((a, b) => a[c.datetime].valueOf() - b[c.datetime].valueOf())
          .entries(selectedPoints)
        const selectedPathColor = d3.color('white')
        selectedPathColor.opacity = 0.8
        this.overlay.context.lineWidth = 2
        this.overlay.context.strokeStyle = selectedPathColor.formatRgb()
        selectedPaths.forEach(d => {
          this.overlay.context.beginPath()
          line(d.values)
          this.overlay.context.stroke()
        })
      }

      // hover paths
      if (hoverPoints.length > 0) {
        const hoverPointsAll = hoverPoints
        const hoverPointIndex = hoverPointsAll.findIndex(b => b.$index === this.hover.$index)
        this.overlay.context.lineWidth = 3

        hoverPointsAll.forEach((d, i) => {
          if (i === 0) return
          const from = hoverPointsAll[i - 1]
          const to = hoverPointsAll[i]
          let color
          if (!this.hoverColor) {
            color = d3.color('white')
          } else if (i <= hoverPointIndex) {
            color = d3.color('deepskyblue')
            color.opacity = 0.8
          } else {
            color = d3.color('orangered')
            color.opacity = 0.8
          }
          this.overlay.context.strokeStyle = color.formatRgb()
          this.overlay.context.beginPath()
          if (this.hoverArrows) {
            this.drawArrow(this.overlay.context, from, to)
          } else {
            line([from, to])
          }
          this.overlay.context.stroke()
        })
      }

      // selected points
      this.overlay.context.lineWidth = 2
      this.overlay.context.strokeStyle = d3.color('white').formatRgb()
      selectedPoints
        .forEach((d) => {
          const point = this.projectCanvasPoint(d)
          const r = this.getSize(d) * 10

          this.overlay.context.fillStyle = d3.color(this.getColor(d)).formatRgb()
          this.overlay.context.beginPath()
          this.overlay.context.arc(point.x, point.y, r, 0, 2 * Math.PI)
          this.overlay.context.fill()
          this.overlay.context.stroke()

          const pickerColor = this.getPickerColor(d.$index)
          this.picker.context.fillStyle = `rgb(${pickerColor})`
          this.picker.context.beginPath()
          this.picker.context.arc(point.x, point.y, r + 2, 0, 2 * Math.PI)
          this.picker.context.fill()
        })

      // hover points
      this.overlay.context.lineWidth = 2
      this.overlay.context.strokeStyle = d3.color('white').formatRgb()
      hoverPoints
        .forEach((d) => {
          const point = this.projectCanvasPoint(d)
          const r = this.getSize(d) * 10

          this.overlay.context.fillStyle = d3.color(this.getColor(d)).formatRgb()
          this.overlay.context.beginPath()
          this.overlay.context.arc(point.x, point.y, r, 0, 2 * Math.PI)
          this.overlay.context.fill()
          this.overlay.context.stroke()

          const pickerColor = this.getPickerColor(d.$index)
          this.picker.context.fillStyle = `rgb(${pickerColor})`
          this.picker.context.beginPath()
          this.picker.context.arc(point.x, point.y, r + 2, 0, 2 * Math.PI)
          this.picker.context.fill()
        })
    },
    getPickerColor (i) {
      return `${((i * 100) % 256)},${(Math.floor((i * 100) / 256) % 256)},${(Math.floor((i * 100) / 65536) % 256)}`
    },
    fitBounds () {
      // console.log('fitBounds()')
      if (!this.boundingBox) return

      const bounds = [
        [this.boundingBox[1][0], this.boundingBox[0][0] - 0.03], // bottomleft
        [this.boundingBox[1][1], this.boundingBox[0][1] + 0.03] // topright
      ]

      this.map.fitBounds(bounds)
    },
    projectCanvasPoint (d) {
      const latLng = new L.LatLng(d[this.project.columns.latitude], d[this.project.columns.longitude])
      const point = this.map.latLngToContainerPoint(latLng)
      const jitter = this.jitterValues[d.$index]

      return {
        x: point.x + jitter.x * Math.pow(this.jitterX, 2),
        y: point.y + jitter.y * Math.pow(this.jitterY, 2)
      }
    },
    drawArrow (context, from, to) {
      // console.log('drawArrow')
      if (!context || !from || !to) return

      let { x: fromx, y: fromy } = this.projectCanvasPoint(from)
      let { x: tox, y: toy } = this.projectCanvasPoint(to)

      const fromr = this.getSize(from) * 10 * 1.0
      const tor = this.getSize(to) * 10 * 1.3 // increase to add more buffer beyond edge of point (only needed for `to` point)

      const dx = tox - fromx
      const dy = toy - fromy
      const angle = Math.atan2(dy, dx)

      // buffer for point radius
      tox -= tor * Math.cos(angle)
      toy -= tor * Math.sin(angle)
      fromx += fromr * Math.cos(angle)
      fromy += fromr * Math.sin(angle)

      // length
      const pathLength = Math.sqrt(dy * dy + dx * dx)
      const arrowSize = pathLength < this.arrowSize ? pathLength : this.arrowSize

      context.moveTo(fromx, fromy)
      context.lineTo(tox, toy)
      context.lineTo(tox - arrowSize * Math.cos(angle - Math.PI / 6), toy - arrowSize * Math.sin(angle - Math.PI / 6))
      context.moveTo(tox, toy)
      context.lineTo(tox - arrowSize * Math.cos(angle + Math.PI / 6), toy - arrowSize * Math.sin(angle + Math.PI / 6))
    }
  },
  render: function (h) {
    return null
  }
}
</script>

<style>
canvas {
  cursor: pointer;
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
