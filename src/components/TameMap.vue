<template>
  <div class="tame-map">
    <l-map ref="map" :center="center" :zoom="zoom" :options="{ ...options, zoomControl: false }" @ready="$emit('ready', map)">
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
    })

    this.svg = d3.select(this.map.getPanes().overlayPane).append('svg')
    this.svg.style('z-index', 201)
    this.overlay = this.svg.append('g').attr('class', 'leaflet-zoom-hide')

    this.$on('resize', this.resize)

    this.ready = true
  },
  methods: {
    resize (bounds) {
      if (bounds) this.bounds = bounds
      const padding = 100

      const topLeft = this.bounds[0]
      const bottomRight = this.bounds[1]

      const width = bottomRight[0] - topLeft[0]
      const height = topLeft[1] - bottomRight[1]

      this.svg.attr('width', width + padding)
        .attr('height', height + padding)
        .style('left', `${topLeft[0] - (padding / 2)}px`)
        .style('top', `${bottomRight[1] - (padding / 2)}px`)

      this.svg.select('g')
        .attr('transform', `translate(${-(topLeft[0] - (padding / 2))},${-(bottomRight[1] - (padding / 2))})`)
    }
  }
}
</script>

<style scoped>
.tame-map {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

/* circle {
  cursor: pointer !important;
  pointer-events: visible !important;
} */
</style>
