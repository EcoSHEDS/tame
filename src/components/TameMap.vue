<template>
  <div class="tame-map">
    <l-map
      ref="map"
      style="width:100%;height:100%"
      :center="center"
      :zoom="zoom"
      :options="{ ...options, zoomControl: false }"
      @ready="$emit('ready', map)">
      <l-control-zoom position="topleft"></l-control-zoom>
      <l-control-layers position="topleft"></l-control-layers>
      <l-control-scale position="bottomleft"></l-control-scale>
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
import { LMap, LTileLayer, LControlZoom, LControlLayers, LControlScale } from 'vue2-leaflet'

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
    LControlLayers,
    LControlScale
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
      moveTimeout = setTimeout(() => {
        this.disableClick = false
      }, 100)
      evt.$emit('map:move', this.map.getCenter())
    })
    this.map.on('zoomend', () => {
      console.log('map:zoomend')
      this.zoomLevel = this.map.getZoom()
      evt.$emit('map:zoom', this.map.getZoom())
      evt.$emit('map:render')
    })

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

.leaflet-control-container > .leaflet-top.leaflet-left {
  left: 500px;
  top: 0px;
}

.leaflet-control-container > .leaflet-bottom.leaflet-left {
  left: 500px;
}

.leaflet-container {
  background: #444 !important;
}
</style>
