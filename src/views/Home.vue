<template>
  <div>
    <tame-map :basemaps="map.basemaps" :center="map.center" :zoom="map.zoom"></tame-map>
      <!-- <tame-map-layer
        name="points"
        set-bounds
        :layer="layer"
        :getFill="getFeatureFill"
        :getValue="getFeatureValue"
        :selected="feature.selected"
        @click="selectFeature">
      </tame-map-layer> -->
    <!-- </tame-map> -->
  </div>
</template>

<script>
import TameMap from '@/components/TameMap'
export default {
  name: 'TameMap',
  components: {
    TameMap
  },
  data () {
    return {
      map: {
        center: [31.5, -89],
        zoom: 10,
        basemaps: [
          {
            name: 'ESRI World Imagery',
            visible: true,
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          },
          {
            name: 'OpenStreetMap',
            visible: false,
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        ]
      }
    }
  }
}
</script>
