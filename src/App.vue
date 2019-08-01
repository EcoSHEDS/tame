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
          :getSize="getSize"
          :selected-id="selected.id"
          :showLines="map.showLines"
          @click="selectId">
        </tame-map-layer>
      </tame-map>
      <v-container fill-height fluid class="ml-2">
        <v-layout row>
          <v-flex grow-shrink-0>
            <v-card width="550" class="mb-3">
              <v-toolbar dark dense color="primary">
                <h4>
                  <v-icon size="18" left>mdi-database</v-icon>
                  <strong>Dataset</strong>: Upper Klamath Lake Suckers
                </h4>
                <v-spacer></v-spacer>
                <v-dialog
                  v-model="dialogs.about"
                  scrollable
                  width="800">
                  <template v-slot:activator="{ on }">
                    <v-btn small class="grey darken-1" rounded v-on="on">
                      <v-icon size="20" left>mdi-alert-circle-outline</v-icon> About
                    </v-btn>
                  </template>

                  <v-card>
                    <v-toolbar dense color="grey lighten-2">
                      <strong>About This Dataset</strong>
                      <v-spacer></v-spacer>
                      <v-btn height="24" width="24" icon @click="dialogs.about = false" class="grey darken-1 elevation-2 mr-0" dark>
                        <v-icon small>mdi-close</v-icon>
                      </v-btn>
                    </v-toolbar>

                    <v-card-text class="mt-2">
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </v-toolbar>
            </v-card>
            <v-card width="550" class="mb-3">
              <v-tabs
                v-model="tabs.active"
                background-color="primary"
                dark
                slider-color="white">
                <v-tab ripple>
                  <v-icon small class="mr-1">mdi-map</v-icon> Map Variables
                </v-tab>
                <v-tab ripple>
                  <v-icon small class="mr-1">mdi-chart-bar</v-icon> Crossfilters
                </v-tab>
                <v-spacer></v-spacer>
                <v-btn height="24" width="24" icon @click="tabs.collapse = !tabs.collapse" class="grey darken-1 elevation-2 mt-3 mr-4" dark>
                  <v-icon v-if="!tabs.collapse">mdi-menu-up</v-icon>
                  <v-icon v-else>mdi-menu-down</v-icon>
                </v-btn>
                <v-tab-item :transition="false" :reverse-transition="false">
                  <v-card v-show="!tabs.collapse">
                    <v-card-text>
                      <v-autocomplete
                        v-model="color.selected"
                        label="Color By"
                        item-value="id"
                        item-text="description"
                        return-object
                        clearable
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
                      <v-switch v-model="map.showLines" label="Show All Connection Lines">
                      </v-switch>
                      <!-- <v-switch v-model="map.showLines">
                        <template v-slot:label>
                          <div>
                            Show All Connection Lines
                            <v-tooltip right max-width="300" open-delay="300">
                              <template v-slot:activator="{ on }">
                                <v-icon right color="grey lighten-1" v-on="on">mdi-alert-circle-outline</v-icon>
                              </template>
                              <div>
                                Show/hide all lines connecting consecutive locations for each individual. <br>
                                Does not apply to individuals that are selected or hovered over.
                              </div>
                            </v-tooltip>
                          </div>
                        </template>
                      </v-switch> -->
                    </v-card-text>
                  </v-card>
                </v-tab-item>
                <v-tab-item :transition="false" :reverse-transition="false">
                  <v-card :max-height="$vuetify.breakpoint.height - 210" style="overflow-y: auto" v-show="!tabs.collapse">
                    <v-card-text>
                      <v-autocomplete
                        :items="filters.options"
                        v-model="filters.selected"
                        multiple
                        dense
                        return-object
                        item-value="id"
                        item-text="description"
                        chips
                        deletable-chips
                        clearable
                        label="Select filter variable(s)...">
                      </v-autocomplete>
                      <p v-if="filters.selected.length > 0" class="subheading">
                        <v-icon small>mdi-alert-circle-outline</v-icon> Click and drag on any chart to filter the dataset.
                      </p>
                      <tame-filter v-for="variable in filters.selected" :key="variable.id" :variable="variable" @close="removeFilter(variable)"></tame-filter>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
              </v-tabs>
            </v-card>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex grow-shrink-0 class="mr-8">
            <v-card width="250" :max-height="$vuetify.breakpoint.height - 280" style="overflow-y: auto" class="mb-3">
              <v-toolbar dense dark color="primary">
                <strong>Legend</strong>
                <v-spacer></v-spacer>
                <v-btn height="24" width="24" icon @click="legend.collapse = !legend.collapse" class="grey darken-1 elevation-2 mr-0" dark>
                  <v-icon v-if="!legend.collapse">mdi-menu-up</v-icon>
                  <v-icon v-else>mdi-menu-down</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text v-show="!legend.collapse">
                <div class="grey--text text--darken-2">
                  <h4>Filtered: {{ crossfilter.counts.filtered.toLocaleString() }} of {{ crossfilter.counts.total.toLocaleString() }} ({{ (crossfilter.counts.filtered / crossfilter.counts.total * 100).toFixed(0) }}%)</h4>
                </div>
                <v-divider class="my-2"></v-divider>
                <tame-legend-color :variable="color.selected"></tame-legend-color>
                <tame-legend-size :variable="size.selected"></tame-legend-size>
                <tame-legend-outline :variable="outline.selected"></tame-legend-outline>
              </v-card-text>
            </v-card>
            <v-card width="250" class="mb-3" v-if="selected.id">
              <v-toolbar dense dark color="primary">
                <strong>Selected Individual</strong>
                <v-spacer></v-spacer>
                <v-btn height="24" width="24" icon @click="selected.collapse = !selected.collapse" class="grey darken-1 elevation-2 mr-0" dark>
                  <v-icon v-if="!selected.collapse">mdi-menu-up</v-icon>
                  <v-icon v-else>mdi-menu-down</v-icon>
                </v-btn>
                <v-tooltip right open-delay="300">
                  <template v-slot:activator="{ on }">
                    <v-btn height="24" width="24" icon @click="selectId()" class="grey darken-1 elevation-2 mr-0 ml-2" dark v-on="on">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </template>
                  <span>Unselect Individual</span>
                </v-tooltip>
              </v-toolbar>
              <v-card-text v-if="!selected.collapse">
                <tame-selected :id="selected.id"></tame-selected>
              </v-card-text>
            </v-card>
            <v-card class="mb-3" v-if="debug.visible">
              <v-toolbar dense dark color="red darken-4">
                <strong>Debug</strong>
                <v-spacer></v-spacer>
                <v-btn height="24" width="24" icon @click="debug.collapse = !debug.collapse" class="grey darken-1 elevation-2 mr-0" dark>
                  <v-icon v-if="!debug.collapse">mdi-menu-up</v-icon>
                  <v-icon v-else>mdi-menu-down</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text v-if="!debug.collapse" style="font-family:monospace">
                map.showLines: {{ map.showLines }}
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
import TameFilter from '@/components/TameFilter'
import TameLegendColor from '@/components/TameLegendColor'
import TameLegendSize from '@/components/TameLegendSize'
import TameLegendOutline from '@/components/TameLegendOutline'
import TameSelected from '@/components/TameSelected'

export default {
  name: 'App',
  components: {
    TameMap,
    TameMapLayer,
    TameFilter,
    TameLegendColor,
    TameLegendSize,
    TameLegendOutline,
    TameSelected
  },
  data: () => ({
    dataset: [],
    dialogs: {
      about: false
    },
    legend: {
      collapse: false
    },
    tabs: {
      active: 0,
      collapse: false
    },
    map: {
      center: [35, -92.8],
      zoom: 5,
      showLines: false,
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
      visible: process.env.NODE_ENV === 'development',
      collapse: false
    },
    crossfilter: {
      counts: {
        filtered: 0,
        total: 0
      }
    },
    selected: {
      collapse: false,
      id: null
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
    },
    filters: {
      selected: [],
      options: [
        {
          id: 'datetime',
          description: 'Date',
          type: 'datetime'
        },
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
        },
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
    this.filters.selected = [this.filters.options[0]]

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
        evt.$emit('filter')
      })
      .catch((err) => {
        console.log(err)
        alert('Failed to load dataset. See console.')
      })
  },
  beforeDestroy () {
    xf.remove(() => true)
    evt.$off('filter', this.onFilter)
  },
  methods: {
    getColor (d, i) {
      if (!d || !this.color.selected || d[this.color.selected.id] === null) {
        return '#888888'
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
      // console.log('app:onFilter')
      this.crossfilter.counts.filtered = xf.allFiltered().length
      this.crossfilter.counts.total = xf.size()
    },
    removeFilter (variable) {
      this.filters.selected.splice(this.filters.selected.findIndex(v => v === variable), 1)
    },
    selectId (d) {
      console.log('app:selectId', d)
      this.selected.id = d
    }
  }
}
</script>

<style>
.leaflet-control-container > .leaflet-top.leaflet-right {
  right: 280px;
  top: 2px;
}
</style>
