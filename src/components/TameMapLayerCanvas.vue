<script>
import { mapGetters } from 'vuex'
import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import * as L from 'leaflet'
import pad from 'pad'

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
    hoverColor: {
      type: Boolean,
      required: false,
      default: true
    },
    showCircles: {
      type: Number,
      required: false,
      default: 2
    },
    showVectors: {
      type: Number,
      required: false,
      default: 1
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
      arrowSize: 12
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
      console.log('tame-map-layer:boundingBox')
      if (this.dataset.length === 0) return null

      const lonExtent = d3.extent(this.dataset.map(d => d[this.project.columns.longitude]))
      const latExtent = d3.extent(this.dataset.map(d => d[this.project.columns.latitude]))
      return [lonExtent, latExtent] // [[xmin, xmax], [ymin, ymax]]
    },
    mappedDataset () {
      console.log('mappedDataset()')
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
        jitterIdMap.set(id, { x: Math.random() - 0.5, y: Math.random() - 0.5 })
      })

      return this.dataset
    },
    jitterDistance () {
      console.log('jitterDistance()')
      const bbox = this.boundingBox
      const bottomLeft = this.map.latLngToContainerPoint(new L.LatLng(bbox[1][0], bbox[0][1]))
      const topRight = this.map.latLngToContainerPoint(new L.LatLng(bbox[1][1], bbox[0][0]))
      const dX = bottomLeft.x - topRight.x
      const dY = bottomLeft.y - topRight.y
      return dX > dY ? dX : dY
    },
    jitterValues () {
      console.log('jitterValues()')
      const values = []
      this.mappedDataset.forEach(d => {
        values[d.$index] = {
          x: jitterIdMap.get(d[this.project.columns.id]).x,
          y: jitterIdMap.get(d[this.project.columns.id]).y
        }
      })
      return values
    }
  },
  mounted () {
    const formatDuration = (x) => {
      const formatter = d3.format(',.2r')
      if (isNaN(x) || !isFinite(x)) return 'None (Last Point)'
      const duration = this.$moment.duration(x, 'days')
      if (x < (1 / 24)) {
        return formatter(duration.as('minutes')) + ' minutes'
      } else if (x < 1) {
        return formatter(duration.as('hours')) + ' hours'
      } else {
        return formatter(duration.as('days')) + ' days'
      }
    }
    const formatDistance = (x) => {
      const formatter = d3.format(',.2r')
      if (isNaN(x) || !isFinite(x)) return 'None (Last Point)'
      if (x < 1) {
        return formatter(x * 100) + ' cm'
      } else if (x > 1000) {
        return formatter(x / 1000) + ' km'
      } else {
        return formatter(x) + ' m'
      }
    }
    const formatVelocity = (x) => {
      if (isNaN(x) || !isFinite(x)) return 'None (Last Point)'
      return formatDistance(x) + '/day'
    }
    const formatBearing = (x) => {
      if (isNaN(x) || !isFinite(x)) return 'None (Last Point)'
      let direction
      if (x < (1 / 16) * 360) {
        direction = 'N'
      } else if (x < (3 / 16) * 360) {
        direction = 'NE'
      } else if (x < (5 / 16) * 360) {
        direction = 'E'
      } else if (x < (7 / 16) * 360) {
        direction = 'SE'
      } else if (x < (9 / 16) * 360) {
        direction = 'S'
      } else if (x < (11 / 16) * 360) {
        direction = 'SW'
      } else if (x < (13 / 16) * 360) {
        direction = 'W'
      } else if (x < (15 / 16) * 360) {
        direction = 'NW'
      } else {
        direction = 'N'
      }
      return `${x.toFixed(0)} degrees (${direction})`
    }

    this.tip.html(d => {
      const primary = `
        <strong>${pad(10, 'Tag ID', '&nbsp;')}: ${d[this.project.columns.id]}</strong><br>
        ${pad(10, 'Location', '&nbsp;')}: ${d[this.project.columns.latitude].toFixed(4)}, ${d[this.project.columns.longitude].toFixed(4)}<br>
        ${pad(10, 'Timestamp', '&nbsp;')}: ${this.$moment.utc(d[this.project.columns.datetime]).format('MMM DD, YYYY hh:mm a')}<br>
      `
      const total = `
        <strong>Total Observed Movement</strong><br>
        ${pad(10, '# Obs', '&nbsp;')}: ${d.$total_n.toFixed(0)}<br>
        ${pad(10, 'Time', '&nbsp;')}: ${formatDuration(d.$total_duration)}<br>
        ${pad(10, 'Distance', '&nbsp;')}: ${formatDistance(d.$total_distance)}<br>
      `
      let next = '<strong>Movement To Next Location</strong><br>'
      if (d.$next) {
        next += `
          ${pad(10, 'Time', '&nbsp;')}: ${formatDuration(d.$duration)}<br>
          ${pad(10, 'Distance', '&nbsp;')}: ${formatDistance(d.$distance)}<br>
          ${pad(10, 'Velocity', '&nbsp;')}: ${formatVelocity(d.$velocity)}<br>
          ${pad(10, 'Bearing', '&nbsp;')}: ${formatBearing(d.$bearing)}<br>
        `
      } else {
        next += '&nbsp;&nbsp;&nbsp;N/A (Last Observation)'
      }
      return `
        ${primary}<br>
        ${total}<br>
        ${next}`
    })

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
    transparency () {
      this.setTransparency()
    },
    project () {
      this.fitBounds()
    },
    selectedIds () {
      this.render()
    },
    jitterX () {
      this.render()
    },
    jitterY () {
      this.render()
    },
    showCircles () {
      this.render()
    },
    showVectors () {
      this.render()
    }
  },
  methods: {
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
        .style('opacity', (1 - this.transparency) * (this.selectedIds.length > 0 ? 0.5 : 1))
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
        x: point.x + jitter.x * Math.pow(this.jitterX, 2) * this.jitterDistance,
        y: point.y + jitter.y * Math.pow(this.jitterY, 2) * this.jitterDistance
      }
    },
    getFillColor (d) {
      let color = d3.color(this.getColor(d))
      if (color === null) {
        color = d3.color('white')
        color.opacity = 0
      }
      return color
    },
    getPickerColor (i) {
      return `${((i * 100) % 256)},${(Math.floor((i * 100) / 256) % 256)},${(Math.floor((i * 100) / 65536) % 256)}`
    },
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
          .attr('cx', point.x + jitter.x * Math.pow(this.jitterX, 2) * this.jitterDistance)
          .attr('cy', point.y + jitter.y * Math.pow(this.jitterY, 2) * this.jitterDistance)
          .attr('r', 0)
          .style('opacity', 0)
          .style('pointer-events', 'none')
          .each(tip.show)
      } else {
        this.tip.hide()
      }
    },
    drawVector (context, from, to, color, buffer) {
      // console.log('drawVector')
      if (!context || !from || !to) return

      context.strokeStyle = color
      context.fillStyle = color

      let { x: fromx, y: fromy } = this.projectCanvasPoint(from)
      let { x: tox, y: toy } = this.projectCanvasPoint(to)

      const dx = tox - fromx
      const dy = toy - fromy
      const angle = Math.atan2(dy, dx)

      // buffer for point radius
      // const fromr = 0.5
      // const tor = 0.5
      // if (buffer) {
      const fromr = 0.5
      let tor = 0.5
      if (buffer) {
        tor = this.getSize(to) * 10 * 1.3 // increase to add more buffer beyond edge of point (only needed for `to` point)
      }
      // tox -= tor * Math.cos(angle)
      // toy -= tor * Math.sin(angle)
      // fromx += fromr * Math.cos(angle)
      // fromy += fromr * Math.sin(angle)
      // }

      tox -= tor * Math.cos(angle)
      toy -= tor * Math.sin(angle)
      fromx += fromr * Math.cos(angle)
      fromy += fromr * Math.sin(angle)

      // length
      const pathLength = Math.sqrt(dy * dy + dx * dx)

      const arrowSize = this.arrowSize < pathLength ? this.arrowSize : pathLength

      context.beginPath()
      context.moveTo(fromx, fromy)
      context.lineTo(tox, toy)
      context.stroke()

      context.beginPath()
      context.moveTo(tox, toy)
      context.lineTo(tox - arrowSize * Math.cos(angle - Math.PI / 6), toy - arrowSize * Math.sin(angle - Math.PI / 6))
      context.lineTo(tox - arrowSize * Math.cos(angle + Math.PI / 6), toy - arrowSize * Math.sin(angle + Math.PI / 6))
      context.fill()
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

      this.renderAllVectors()
      this.renderAllCircles()
    },
    renderAllCircles () {
      // console.log('renderAllCircles')
      this.base.context.lineWidth = 0.5
      xf.allFiltered().forEach((d, i) => {
        const point = this.projectCanvasPoint(d)
        const r = this.getSize(d) * 10

        if (this.showCircles >= 2) {
          this.base.context.fillStyle = this.getFillColor(d).formatRgb()
          this.base.context.strokeStyle = d3.color(this.getOutline(d)).formatRgb()
          this.base.context.beginPath()
          this.base.context.arc(point.x, point.y, r, 0, 2 * Math.PI)
          this.base.context.fill()
          this.base.context.stroke()
        }

        const pickerColor = this.getPickerColor(d.$index)
        this.picker.context.fillStyle = `rgb(${pickerColor})`
        this.picker.context.beginPath()
        this.picker.context.arc(point.x, point.y, r + 2, 0, 2 * Math.PI)
        this.picker.context.fill()

        // add next circle even if not filtered for hover interaction
        if (d.$next && !xf.isElementFiltered(d.$next.$index)) {
          const pickerColor = this.getPickerColor(d.$next.$index)
          const point = this.projectCanvasPoint(d.$next)
          const r = this.getSize(d.$next) * 10
          this.picker.context.fillStyle = `rgb(${pickerColor})`
          this.picker.context.beginPath()
          this.picker.context.arc(point.x, point.y, r + 2, 0, 2 * Math.PI)
          this.picker.context.fill()
        }
      })
    },
    renderAllVectors () {
      // console.log('renderAllVectors')
      if (this.showVectors < 2) return

      this.base.context.lineWidth = 1
      xf.allFiltered().forEach(d => this.drawVector(this.base.context, d, d.$next, this.getFillColor(d).formatRgb(), this.showCircles >= 2))
    },
    renderOverlay () {
      // console.log('renderOverlay')
      if (!this.overlay.context) return

      this.overlay.context.clearRect(0, 0, this.overlay.canvas.width, this.overlay.canvas.height)

      if (!this.project) return

      this.setTransparency()

      const c = this.project.columns
      const hoverPoints = this.hover ? xf.all().filter(d => this.hover[c.id] === d[c.id]) : []
      const selectedPoints = this.selectedIds.length > 0 ? xf.allFiltered().filter(d => this.selectedIds.includes(d[c.id])) : []

      this.renderSelectedVectors(selectedPoints)
      this.renderHoverVectors(hoverPoints)
      this.renderSelectedCircles(selectedPoints)
      this.renderHoverCircles(hoverPoints)
    },
    renderHoverCircles (values) {
      this.overlay.context.lineWidth = 2
      values.forEach((d) => {
        const point = this.projectCanvasPoint(d)
        const r = this.getSize(d) * 10

        const fillColor = this.getFillColor(d)
        const strokeColor = d3.color(this.getOutline(d))

        if (!xf.isElementFiltered(d.$index)) {
          fillColor.opacity *= 0.5
          strokeColor.opacity *= 0.5
        }

        this.overlay.context.fillStyle = fillColor.formatRgb()
        this.overlay.context.strokeStyle = strokeColor.formatRgb()
        this.overlay.context.beginPath()
        this.overlay.context.arc(point.x, point.y, r, 0, 2 * Math.PI)
        this.overlay.context.fill()
        this.overlay.context.stroke()
      })
    },
    renderHoverVectors (values) {
      if (values.length === 0) return

      values.forEach((d, i) => {
        let color
        if (!this.hoverColor) {
          color = this.getFillColor(d)
        } else if (d[this.project.columns.datetime] < this.hover[this.project.columns.datetime]) {
          color = d3.color('deepskyblue')
          color.opacity = 0.8
        } else {
          color = d3.color('orangered')
          color.opacity = 0.8
        }
        if (!xf.isElementFiltered(d.$index)) {
          color.opacity *= 0.5
        }
        this.drawVector(this.overlay.context, d, d.$next, color.formatRgb(), true)
      })
    },
    renderSelectedCircles (data) {
      this.overlay.context.lineWidth = 2
      data.forEach((d) => {
        const point = this.projectCanvasPoint(d)
        const r = this.getSize(d) * 10

        if (this.showCircles >= 1) {
          this.overlay.context.fillStyle = this.getFillColor(d).formatRgb()
          this.overlay.context.strokeStyle = d3.color(this.getOutline(d)).formatRgb()
          this.overlay.context.beginPath()
          this.overlay.context.arc(point.x, point.y, r, 0, 2 * Math.PI)
          this.overlay.context.fill()
          this.overlay.context.stroke()
        }

        const pickerColor = this.getPickerColor(d.$index)
        this.picker.context.fillStyle = `rgb(${pickerColor})`
        this.picker.context.beginPath()
        this.picker.context.arc(point.x, point.y, r + 2, 0, 2 * Math.PI)
        this.picker.context.fill()

        // add next circle even if not filtered for hover interaction
        if (d.$next && !xf.isElementFiltered(d.$next.$index)) {
          const pickerColor = this.getPickerColor(d.$next.$index)
          const point = this.projectCanvasPoint(d.$next)
          const r = this.getSize(d.$next) * 10
          this.picker.context.fillStyle = `rgb(${pickerColor})`
          this.picker.context.beginPath()
          this.picker.context.arc(point.x, point.y, r + 2, 0, 2 * Math.PI)
          this.picker.context.fill()
        }
      })
    },
    renderSelectedVectors (data) {
      if (data.length === 0 || this.showVectors < 1) return

      this.overlay.context.lineWidth = 3
      data.forEach(d => this.drawVector(this.overlay.context, d, d.$next, this.getFillColor(d).formatRgb(), this.showCircles >= 1))
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
  background: rgba(255, 255, 255, 0.75);
  color: #000;
  border-radius: 4px;
  pointer-events: none;
  font-family: 'Roboto Mono', monospace;
  z-index: 1000;
  margin-left: 20px;
}
</style>
