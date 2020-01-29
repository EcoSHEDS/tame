<template>
  <div class="tame-map">
    <l-map
      ref="map"
      style="width:100%;height:100%"
      :center="center"
      :zoom="zoom"
      :options="{ ...options, zoomControl: false }"
      @ready="$emit('ready', map)">
      <l-control-zoom position="topright"></l-control-zoom>
      <l-control-layers position="topright"></l-control-layers>
      <l-tile-layer
        v-for="tile in basemaps"
        :key="tile.name"
        :name="tile.name"
        :visible="tile.visible"
        :url="tile.url"
        :attribution="tile.attribution"
        layer-type="base">
      </l-tile-layer>
    </l-map>
    <slot v-if="ready"></slot>
  </div>
</template>

<script>
import { LMap, LTileLayer, LControlZoom, LControlLayers } from 'vue2-leaflet'
import L from 'leaflet'
import * as d3 from 'd3'

import evt from '@/events'

export default {
  name: 'TameMap',
  props: {
    options: {
      type: Object,
      required: false,
      default: () => {}
    },
    center: {
      type: Array,
      required: false,
      default: () => [42, -72]
    },
    zoom: {
      type: Number,
      required: false,
      default: 8
    },
    basemaps: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  components: {
    LMap,
    LTileLayer,
    LControlZoom,
    LControlLayers
    // LControlDraw
  },
  data: () => ({
    ready: false,
    map: null,
    disableClick: false,
    bounds: null,
    zoomLevel: null
  }),
  mounted () {
    this.map = this.$refs.map.mapObject
    this.zoomLevel = this.map.getZoom()

    let moveTimeout
    this.map.on('movestart', () => {
      window.clearTimeout(moveTimeout)
      this.disableClick = true
    })
    this.map.on('moveend', () => {
      // console.log('center:', this.map.getCenter())
      moveTimeout = setTimeout(() => {
        this.disableClick = false
      }, 100)
      evt.$emit('map:move', this.map.getCenter())
    })
    this.map.on('zoomend', () => {
      // console.log('zoom:', this.map.getZoom())
      this.zoomLevel = this.map.getZoom()
      evt.$emit('map:zoom', this.map.getZoom())
      evt.$emit('map:render')
    })

    const svgLayer = L.svg()
    this.map.addLayer(svgLayer)

    this.svg = d3.select(svgLayer.getPane()).select('svg')
      .classed('leaflet-zoom-animated', false)
      .classed('leaflet-zoom-hide', true)
      .classed('map', true)
      .attr('pointer-events', null)
      .style('z-index', 201)

    this.ready = true
  },
  methods: {
  }
}
</script>

<style>
.tame-map {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.tame-map circle {
  cursor: pointer !important;
  pointer-events: visible !important;
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

.leaflet-control-container > .leaflet-top.leaflet-right {
  right: 310px;
  top: 2px;
}

/* circle {
  cursor: pointer !important;
  pointer-events: visible !important;
} */
</style>
