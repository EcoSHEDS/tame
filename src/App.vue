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
        <tame-map-layer
          :data="dataset"
          :getColor="getColor"
          :getOutline="getOutline"
          :getSize="getSize">
        </tame-map-layer>
      </tame-map>
      <v-container fill-height d-block ml-0 style="width:600px">
        <v-layout column>
          <v-flex>
            <v-card class="mb-3">
              <v-toolbar dark dense color="primary">
                <h3>
                  <v-icon size="20" left>mdi-database</v-icon>
                  <strong>Dataset</strong>: Upper Klamath Lake Suckers
                </h3>
                <v-spacer></v-spacer>
                <v-btn small class="grey darken-1" rounded>
                  <v-icon size="20" left>mdi-information</v-icon> About
                </v-btn>
                <v-btn height="24" width="24" icon @click="toolbox.collapse = !toolbox.collapse" class="grey darken-1 elevation-2 mr-0 ml-2" dark>
                  <v-icon v-if="!toolbox.collapse">mdi-menu-up</v-icon>
                  <v-icon v-else>mdi-menu-down</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text v-if="!toolbox.collapse">
                <v-autocomplete
                  v-model="color.selected"
                  label="Color By"
                  item-value="id"
                  item-text="description"
                  return-object
                  :items="color.options">
                </v-autocomplete>
                <v-autocomplete
                  v-model="size.selected"
                  label="Size By"
                  item-value="id"
                  item-text="description"
                  return-object
                  clearable
                  :items="size.options">
                </v-autocomplete>
                <v-autocomplete
                  v-model="outline.selected"
                  label="Outline By"
                  item-value="id"
                  item-text="description"
                  return-object
                  clearable
                  :items="outline.options">
                </v-autocomplete>
              </v-card-text>
            </v-card>
            <v-card class="mb-3">
              <v-toolbar dense dark color="primary">
                <strong>Time Filter</strong>
                <v-spacer></v-spacer>
                <v-btn height="24" width="24" icon @click="timeFilter.collapse = !timeFilter.collapse" class="grey darken-1 elevation-2 mr-0" dark>
                  <v-icon v-if="!timeFilter.collapse">mdi-menu-up</v-icon>
                  <v-icon v-else>mdi-menu-down</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text v-if="!timeFilter.collapse">
                <tame-time-filter v-if="timeFilter.ready"></tame-time-filter>
              </v-card-text>
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
                <!-- color.selected: {{ color.selected }} <br>
                size.selected: {{ size.selected }} <br>
                outline.selected: {{ outline.selected }} <br> -->
                counts: {{ crossfilter.counts }} <br>
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

import evt from '@/events'
import { xf } from '@/crossfilter'

import TameMap from '@/components/TameMap'
import TameMapLayer from '@/components/TameMapLayer'
import TameTimeFilter from '@/components/TameTimeFilter'

export default {
  name: 'App',
  components: {
    TameMap,
    TameMapLayer,
    TameTimeFilter
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
    toolbox: {
      collapse: false
    },
    timeFilter: {
      collapse: false,
      ready: false
    },
    debug: {
      visible: process.env.NODE_ENV === 'development',
      collapse: false
    },
    crossfilter: {
      counts: {
        filtered: 0,
        total: 0
      }
    },
    color: {
      selected: null,
      options: [
        {
          id: 'length',
          description: 'Individual Length',
          type: 'continuous',
          domain: [150, 250]
        },
        {
          id: 'season',
          description: 'Season',
          type: 'discrete',
          domain: ['Spring', 'Summer', 'Fall']
        },
        {
          id: 'cohort',
          description: 'Cohort',
          type: 'discrete',
          domain: ['TNC', 'Rocky Point', 'Shoalwater Bay']
        }
      ]
    },
    size: {
      selected: null,
      options: [
        {
          id: 'length',
          description: 'Individual Length',
          type: 'continuous',
          domain: [150, 250]
        }
      ]
    },
    outline: {
      selected: null,
      options: [
        {
          id: 'active',
          description: 'Active',
          type: 'discrete',
          domain: ['Inactive', 'Active']
        }
      ]
    }
  }),
  computed: {
    colorScale () {
      let valueScale, colorScale, scale
      if (this.color.selected && this.color.selected.type === 'continuous') {
        valueScale = d3.scaleLinear()
          .domain(this.color.selected.domain)
          .range([0, 1])
          .clamp(true)
        colorScale = d3.scaleSequential(d3.interpolateViridis)
        scale = (x) => colorScale(valueScale(x))
      } else {
        scale = d3.scaleOrdinal(d3.schemeCategory10)
          .domain(this.color.selected.domain)
      }
      return scale
    },
    outlineScale () {
      return d3.scaleOrdinal(['orangered', 'white'])
        .domain(this.outline.selected.domain)
    },
    sizeScale () {
      return d3.scaleLinear()
        .domain(this.size.selected.domain)
        .range([0.1, 1])
        .clamp(true)
    }
  },
  watch: {
    'color.selected': () => {
      evt.$emit('map:render')
    },
    'outline.selected': () => {
      evt.$emit('map:render')
    },
    'size.selected': () => {
      evt.$emit('map:render')
    }
  },
  mounted () {
    this.color.selected = this.color.options[2]
    this.outline.selected = this.outline.options[0]
    this.size.selected = this.size.options[0]

    evt.$on('filter', this.onFilter)
    this.$http.get('ukl-suckers.csv')
      .then((response) => {
        const data = d3.csvParse(response.data)
        const timeParser = d3.utcParse('%Y-%m-%dT%H:%M:%SZ')
        data.forEach((row, index) => {
          row.$index = index
          row.datetime = timeParser(row.datetime)
          row.length = +row.length
          row.lat = +row.lat
          row.lon = +row.lon
        })
        this.dataset = data
        xf.add(data)
        this.timeFilter.ready = true
        evt.$emit('filter')
      })
      .catch((err) => {
        console.log(err)
        alert('Failed to load dataset. See console.')
      })
  },
  methods: {
    getColor (d) {
      if (!d || !this.color.selected || d[this.color.selected.id] === null) {
        return '#AAAAA'
      }
      return this.colorScale(d[this.color.selected.id])
    },
    getOutline (d) {
      if (!d || !this.outline.selected || d[this.outline.selected.id] === null) {
        return '#FFFFFF'
      }
      return this.outlineScale(d[this.outline.selected.id])
    },
    getSize (d) {
      if (!d || !this.size.selected || d[this.size.selected.id] === null) {
        return 0.5
      }
      return this.sizeScale(d[this.size.selected.id])
    },
    onFilter () {
      console.log('app:onFilter')
      this.crossfilter.counts.filtered = xf.allFiltered().length
      this.crossfilter.counts.total = xf.size()
      evt.$emit('map:render')
    }
  }
}
</script>
