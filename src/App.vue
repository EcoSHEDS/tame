<template>
  <v-app>
    <v-app-bar app clipped-left dark>
      <v-toolbar-title class="headline">
        <span>SHEDS</span>
        <span class="font-weight-light px-2">|</span>
        <span class="font-weight-light">Tagged Animal Movement Explorer (TAME)</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text small href="http://ecosheds.org">
        <v-icon small left>mdi-home</v-icon> SHEDS
      </v-btn>
    </v-app-bar>

    <v-content>
      <tame-map :center="map.center" :zoom="map.zoom" :basemaps="map.basemaps">
        <tame-map-layer :data="dataset"></tame-map-layer>
      </tame-map>
      <v-container fill-height d-block ml-0 style="width:800px">
        <v-layout column>
          <v-flex>
            <v-card class="mb-3">
              <v-toolbar dark dense color="primary" class="">
                <h3>
                  <v-icon size="20" left>mdi-database</v-icon>
                  <strong>Dataset</strong>: Upper Klamath Lake Suckers
                </h3>
                <v-spacer></v-spacer>
                <v-btn small color="grey darken-1" rounded>
                  <v-icon size="20" left>mdi-information</v-icon> About
                </v-btn>
              </v-toolbar>
            </v-card>
            <v-card v-if="debug.visible">
              <v-toolbar dense dark color="red darken-4">
                <strong>Debug</strong>
                <v-spacer></v-spacer>
                <v-btn height="24" width="24" icon @click="debug.collapse = !debug.collapse" class="grey darken-1 elevation-2 mr-0" dark>
                  <v-icon v-if="!debug.collapse">mdi-menu-up</v-icon>
                  <v-icon v-else>mdi-menu-down</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text v-if="!debug.collapse" style="font-family:monospace">
                <!-- map.center: {{ map.center }} <br> -->
                <!-- map.zoom: {{ map.zoom }} -->
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import * as d3 from 'd3'

import TameMap from '@/components/TameMap'
import TameMapLayer from '@/components/TameMapLayer'

export default {
  name: 'App',
  components: {
    TameMap,
    TameMapLayer
  },
  data: () => ({
    dataset: [],
    map: {
      center: [35, -92.8],
      zoom: 5,
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
        },
        {
          name: 'No Basemap',
          visible: false,
          url: '',
          attribution: ''
        }
      ]
    },
    debug: {
      visible: true,
      collapse: false
    }
  }),
  mounted () {
    d3.csv('http://localhost:8083/ukl-suckers.csv')
      .then((data) => {
        const timeParser = d3.utcParse('%Y-%m-%dT%H:%M:%SZ')
        data.forEach((row, index) => {
          row.$index = index
          row.datetime = timeParser(row.datetime)
          row.length = +row.length
          row.lat = +row.lat
          row.lon = +row.lon
          row.active = +row.active
        })
        this.dataset = data
        window.data = data
      })
  }
}
</script>
