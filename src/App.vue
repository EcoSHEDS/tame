<template>
  <v-app>
    <v-app-bar app clipped-left dark>
      <v-toolbar-title class="headline">
        <span>SHEDS</span>
        <span class="font-weight-light px-2">|</span>
        <span class="font-weight-light">Tagged Animal Movement Explorer (TAME)</span>
        <!-- <span class="font-weight-light px-2">|</span> -->
        <span class="text-uppercase overline ml-3">Alpha Version</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text small href="https://ecosheds.org">
        <v-icon small left>mdi-home</v-icon> SHEDS
      </v-btn>
    </v-app-bar>

    <v-content>
      <TameMap :center="map.center" :zoom="map.zoom" :basemaps="map.basemaps" @ready="mapIsReady">
        <TameMapLayer
          :data="dataset"
          :getColor="getColor"
          :getOutline="getOutline"
          :getSize="getSize"
          :selected-ids="selected.ids"
          :showLines="map.showLines"
          @click="selectId">
        </TameMapLayer>
      </TameMap>
      <v-container fill-height fluid class="ml-2">
        <v-layout row>
          <v-flex grow-shrink-0>
            <v-card width="550" class="mb-3">
              <v-toolbar dark dense color="primary">
                <h4>
                  <v-icon size="18" left>mdi-database</v-icon>
                  <strong>Dataset</strong>: {{ theme ? theme.label : 'None' }}
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
                  <v-icon small class="mr-1">mdi-crosshairs-gps</v-icon> Selection
                </v-tab>
                <v-tab ripple>
                  <v-icon small class="mr-1">mdi-chart-bar</v-icon> Filters
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
                      <h3>Selected Individuals</h3>

                      <div class="my-3"># Selected Individuals: <span class="black--text">{{ selected.ids.length }}</span></div>

                      <div class="my-4" >
                        <v-btn @click="unselectAll" rounded :disabled="selected.ids.length === 0">
                          <v-icon small left>mdi-delete</v-icon> Unselect All
                        </v-btn>
                      </div>

                      <div class="subheading my-4">
                        <v-icon small>mdi-alert-circle-outline</v-icon>
                        Click a point on the map to select an individual (unique tag ID), which will highlight all locations that individual was observed.
                        Click on a selected individual to unselect it.
                        More than one individual can be selected at a time.
                      </div>

                      <v-divider class="my-3"></v-divider>

                      <h3>Select By Area</h3>

                      <div class="my-3"># Selection Areas: <span class="black--text">{{ draw.count }}</span></div>

                      <div class="my-4">
                        <v-radio-group v-model="draw.operation" row hide-details label="Operation:" :disabled="draw.enabled">
                          <v-radio value="intersection">
                            <template v-slot:label>
                              <div>Intersection (<v-icon>mdi-set-center</v-icon>)</div>
                            </template>
                          </v-radio>
                          <v-radio value="union">
                            <template v-slot:label>
                              <div>Union (<v-icon>mdi-set-all</v-icon>)</div>
                            </template>
                          </v-radio>
                        </v-radio-group>
                      </div>

                      <div class="my-4">
                        <v-btn @click="toggleDraw" rounded v-if="!draw.enabled">
                          <v-icon small left>mdi-selection-drag</v-icon> Draw New Area
                        </v-btn>
                        <v-btn @click="toggleDraw" rounded v-else>
                          <v-icon small left>mdi-close</v-icon> Cancel
                        </v-btn>
                        <v-btn @click="clearDraw" rounded class="ml-3" :disabled="draw.count === 0">
                          <v-icon small left>mdi-delete</v-icon> Clear All
                        </v-btn>
                      </div>

                      <div class="subheading my-3">
                        <v-icon small>mdi-alert-circle-outline</v-icon>
                        Select all individuals that were observed in a specific area by clicking <strong>Draw New Area</strong>
                        and then click-and-drag to draw the target area on the map.
                        Add more areas to select individuals that passed through multiple areas.
                        <strong>Intersection</strong> selects individuals that passed through ALL areas, <strong>Union</strong> selects individuals that passed through ANY of the areas.
                        These selections are not affected by the crossfilters.
                      </div>
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
                        <v-icon small>mdi-alert-circle-outline</v-icon>
                        Use the dropdown above to add/remove filters.
                        Each filter shows a histogram of the observations.
                        Click and drag on a histogram to filter the dataset.
                        Only observations that meet ALL filter criteria are shown on the map.
                      </p>
                      <TameFilter v-for="variable in filters.selected" :key="variable.id" :variable="variable" @close="removeFilter(variable)"></TameFilter>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
              </v-tabs>
            </v-card>
          </v-flex>
          <v-spacer></v-spacer>
          <v-flex grow-shrink-0 class="mr-8">
            <v-card width="250" :max-height="$vuetify.breakpoint.height - 100 - 120 * debug.visible" style="overflow-y: auto" class="mb-3">
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
                  <h4>Filter Summary</h4>
                  <div class="pl-2">
                    Records:
                    {{ counts.records.filtered.toLocaleString() }} of {{ counts.records.total.toLocaleString() }}
                    <span v-if="counts.records.total > 0">({{ (counts.records.filtered / counts.records.total * 100).toFixed(0) }}%)</span>
                  </div>
                  <div class="pl-2">
                    Tags:
                    {{ counts.tags.filtered.toLocaleString() }} of {{ counts.tags.total.toLocaleString() }}
                    <span v-if="counts.tags.total > 0">({{ (counts.tags.filtered / counts.tags.total * 100).toFixed(0) }}%)</span>
                  </div>
                </div>
                <v-divider class="my-2"></v-divider>
                <TameLegendColor :variable="color.selected"></TameLegendColor>
                <TameLegendSize :variable="size.selected"></TameLegendSize>
                <TameLegendOutline :variable="outline.selected"></TameLegendOutline>
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
                selected.ids: {{ selected.ids.length }}
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
import L from 'leaflet'

import evt from '@/events'
import { xf } from '@/crossfilter'

import TameMap from '@/components/TameMap'
import TameMapLayer from '@/components/TameMapLayer'
import TameFilter from '@/components/TameFilter'
import TameLegendColor from '@/components/TameLegendColor'
import TameLegendSize from '@/components/TameLegendSize'
import TameLegendOutline from '@/components/TameLegendOutline'

export default {
  name: 'App',
  components: {
    TameMap,
    TameMapLayer,
    TameFilter,
    TameLegendColor,
    TameLegendSize,
    TameLegendOutline
  },
  data: () => ({
    theme: null,
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
    counts: {
      records: {
        filtered: 0,
        total: 0
      },
      tags: {
        filtered: 0,
        total: 0
      }
    },
    tags: {
      dim: null,
      group: null
    },
    selected: {
      collapse: false,
      ids: []
    },
    draw: {
      enabled: false,
      control: null,
      operation: 'intersection',
      rect: null,
      count: 0
    },
    color: {
      selected: null,
      options: []
    },
    size: {
      selected: null,
      options: []
    },
    outline: {
      selected: null,
      options: []
    },
    filters: {
      selected: [],
      options: []
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
    },
    'draw.operation' () {
      this.onDraw()
    }
  },
  mounted () {
    evt.$on('filter', this.onFilter)
    this.loadTheme('deerfield')
  },
  beforeDestroy () {
    xf.remove(() => true)
    evt.$off('filter', this.onFilter)
  },
  methods: {
    loadTheme (id) {
      this.$http.get(`${id}/theme.json`)
        .then((response) => {
          this.theme = response.data

          return this.theme
        })
        .then((theme) => {
          return this.$http.get(`${theme.id}/data.csv`)
            .then((response) => {
              let data = d3.csvParse(response.data)
              const timeParser = d3.utcParse('%Y-%m-%dT%H:%M:%SZ')
              const numericVariables = theme.variables.filter(d => d.type === 'continuous').map(d => d.id)

              data.forEach((row, index) => {
                row.$index = index
                row.datetime = timeParser(row.datetime)
                row.lat = +row.lat
                row.lon = +row.lon
                numericVariables.forEach(v => {
                  row[v] = +row[v]
                })
              })

              const groupByTag = d3.nest()
                .key(d => d[theme.columns.id])
                .sortValues((a, b) => (a.datetime < b.datetime ? -1 : a.datetime > b.datetime ? 1 : a.datetime >= b.datetime ? 0 : NaN))
                .entries(data)

              const mapByIndex = new Map()
              groupByTag.forEach(d => {
                const n = d.values.length

                if (n <= 1) return

                for (let i = 0; i < (n - 1); i++) {
                  const start = d.values[i]
                  const end = d.values[i + 1]

                  const days = (end.datetime - start.datetime) / 1000 / 86400
                  const meters = L.latLng(start.lat, start.lon).distanceTo([end.lat, end.lon])

                  const velocity = meters / days

                  mapByIndex.set(start.$index, {
                    '$duration': days,
                    '$distance': meters,
                    '$velocity': velocity
                  })
                }

                mapByIndex.set(d.values[n - 1].$index, {
                  '$duration': null,
                  '$distance': null,
                  '$velocity': null
                })
              })

              this.dataset = data.map(d => ({
                ...d,
                ...mapByIndex.get(d.$index)
              }))

              this.tags.dim = xf.dimension(d => d[theme.columns.id])
              this.tags.group = this.tags.dim.group().reduceCount()

              // const velocityDomain = [
              //   d3.quantile(this.dataset, 0.05, d => d.$velocity),
              //   d3.quantile(this.dataset.filter(d => isFinite(d.$velocity)), 0.9, d => d.$velocity)
              // ]
              const velocityDomain = [0, d3.quantile(this.dataset.filter(d => isFinite(d.$velocity)), 0.9, d => d.$velocity)]

              xf.add(this.dataset)

              this.color.options = [
                {
                  id: 'uid',
                  description: 'Individual ID',
                  type: 'discrete',
                  domain: [...new Set(data.map(d => d.uid))].sort(d3.ascending)
                },
                ...this.theme.variables.filter(d => d.color)
              ]
              this.outline.options = this.theme.variables.filter(d => d.outline)
              this.size.options = this.theme.variables.filter(d => d.size)
              this.filters.options = [
                {
                  id: 'datetime',
                  description: 'Date',
                  type: 'datetime'
                },
                {
                  id: '$velocity',
                  description: 'Velocity (m/day)',
                  type: 'continuous',
                  domain: [Math.floor(velocityDomain[0]), Math.ceil(velocityDomain[1])]
                },
                {
                  id: '$distance',
                  description: 'Distance to Next Location (m)',
                  type: 'continuous',
                  domain: [0, Math.ceil(d3.max(this.dataset, d => d.$distance))]
                },
                {
                  id: '$duration',
                  description: 'Time to Next Location (days)',
                  type: 'continuous',
                  domain: [0, Math.ceil(d3.max(this.dataset, d => d.$duration))]
                },
                ...this.theme.variables.filter(d => d.filter)
              ]

              this.color.selected = this.color.options.length > 0 ? this.color.options[0] : null
              this.outline.selected = this.outline.options.length > 0 ? this.outline.options[0] : null
              this.size.selected = this.size.options.length > 0 ? this.size.options[0] : null
              this.filters.selected = [this.filters.options[0]]

              evt.$emit('filter')
            })
            .catch((err) => {
              console.log(err)
              alert('Failed to load dataset. See console.')
            })
        })
        .catch((err) => {
          console.log(err)
          alert('Failed to load theme. See console.')
        })
    },
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
    removeFilter (variable) {
      this.filters.selected.splice(this.filters.selected.findIndex(v => v === variable), 1)
    },
    onFilter () {
      this.counts.records.filtered = xf.allFiltered().length
      this.counts.records.total = xf.size()

      this.counts.tags.filtered = this.tags.group.all().filter(d => d.value > 0).length
      this.counts.tags.total = this.tags.group.size()
    },
    selectByAreas (features) {
      if (!features || features.features.length === 0) {
        this.selected.ids = []
        return
      }
      const allRows = xf.all()
      if (this.draw.operation === 'intersection') {
        this.selected.ids = this.selectByAreasIntersection(allRows, features)
      } else if (this.draw.operation === 'union') {
        this.selected.ids = this.selectByAreasUnion(allRows, features)
      } else {
        alert('Invalid area selection operation')
      }
    },
    selectByAreasIntersection (allRows, features) {
      let rows = allRows
      let ids = [...new Set(allRows.map(d => d.uid))]
      features.features.forEach((feature, i) => {
        rows = this.pointsInArea(allRows.filter(d => ids.includes(d.uid)), feature)
        ids = [...new Set(rows.map(d => d.uid))]
      })
      return ids
    },
    selectByAreasUnion (allRows, features) {
      let rows = this.pointsInArea(allRows, features)
      return [...new Set(rows.map(d => d.uid))]
    },
    pointsInArea (points, feature) {
      return points.filter(d => d3.geoContains(feature, [d.lon, d.lat]))
    },
    selectId (id) {
      console.log('app:selectId', id)
      if (this.selected.ids.includes(id)) {
        const index = this.selected.ids.findIndex(d => d === id)
        index > -1 && this.selected.ids.splice(index, 1)
      } else {
        this.selected.ids.push(id)
      }
    },
    unselectAll () {
      this.selected.ids = []
      this.clearDraw()
    },
    toggleDraw () {
      if (this.draw.rect.enabled()) {
        this.draw.rect.disable()
      } else {
        this.draw.rect.enable()
      }
      this.draw.enabled = this.draw.rect.enabled()
    },
    onDraw () {
      this.draw.count = this.draw.layer.getLayers().length
      this.draw.enabled = false
      this.selectByAreas(this.draw.layer.toGeoJSON())
    },
    clearDraw () {
      // console.log('clearDraw()')
      this.draw.layer.eachLayer(d => this.draw.layer.removeLayer(d))
      this.onDraw()
    },
    mapIsReady (map) {
      // console.log('mapIsReady', map)
      this.draw.map = map
      this.draw.layer = new L.FeatureGroup()
      this.draw.map.addLayer(this.draw.layer)
      this.draw.rect = new L.Draw.Rectangle(this.draw.map)
      map.on('draw:created', ({ layer }) => {
        this.draw.layer.addLayer(layer)
        this.onDraw()
      })
      map.on('draw:deleted', ({ layer }) => {
        this.onDraw()
      })
    }
  }
}
</script>

<style>
</style>
