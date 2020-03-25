<template>
  <v-app>
    <!-- USGS header -->
    <UsgsHeader v-if="usgs"></UsgsHeader>

    <TameAppBar v-if="$vuetify.breakpoint.mdAndUp"></TameAppBar>
    <v-app-bar app dense clipped-left dark absolute :style="{'margin-top': usgs ? '72px' : '0'}" v-else>
      <v-toolbar-title class="subheading">
        <span>Tagged Animal Movement Explorer (TAME)</span>
        <span class="text-uppercase overline ml-3">Beta</span>
      </v-toolbar-title>
    </v-app-bar>

    <v-content class="grey lighten-3" v-if="$vuetify.breakpoint.mdAndUp">
      <TameMap :center="map.center" :zoom="map.zoom" :basemaps="map.basemaps" @ready="mapIsReady">
        <TameMapLayer
          v-if="ready"
          :data="dataset"
          :getColor="getColor"
          :getOutline="getOutline"
          :getSize="getSize"
          :selected-ids="selected.ids"
          :opacity-unselected="map.opacityUnselected"
          @click="selectId">
        </TameMapLayer>
      </TameMap>
      <v-container fill-height fluid class="align-stretch pa-2">
        <v-row no-gutters>
          <v-col>
            <v-card width="475" class="mb-3" style="background:transparent" elevation="0">
              <v-card-actions class="pa-0 pr-2">
                <v-btn color="blue-grey" style="width:50%" dark :to="{ name: 'newProject' }">
                  <v-icon left small>mdi-pencil</v-icon>New Project
                </v-btn>
                <v-btn color="blue-grey" style="width:50%" dark :to="{ name: 'listProjects' }">
                  <v-icon left small>mdi-folder-open-outline</v-icon>Load Project
                </v-btn>
              </v-card-actions>
            </v-card>
            <v-card width="475" class="mb-3" v-if="ready">
              <v-toolbar dark dense color="primary">
                <h4>
                  <span v-if="ready" class="subtitle-1 font-weight-bold">
                    <v-icon left v-if="!project.id">mdi-paperclip</v-icon>
                    <v-icon left v-else>mdi-database</v-icon>
                    {{ project ? project.name : 'None' | truncate(50) }}
                  </span>
                  <span v-else-if="loading">
                    <v-progress-circular
                      :width="3"
                      :size="24"
                      indeterminate
                      class="mr-4">
                    </v-progress-circular>
                    Loading
                  </span>
                  <span v-else-if="error">
                    <v-icon left color="error">mdi-alert</v-icon> {{ error }}
                  </span>
                  <span v-else>
                    <router-link style="color:white" :to="{name: 'newProject'}">Create a new project</router-link> or
                    <router-link style="color:white" :to="{name: 'listProjects'}">load an existing one</router-link>.
                  </span>
                </h4>
                <v-spacer></v-spacer>
                <v-btn small icon @click="closeProject">
                  <v-icon small>mdi-close</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-actions v-if="isOwner || !project.id">
                <v-btn small rounded v-if="isOwner || !project.id" :to="{ name: 'editProject' }"><v-icon left small>mdi-pencil</v-icon>Edit Project</v-btn>
                <v-spacer></v-spacer>
                <v-btn small rounded v-if="isOwner && !!project.id" :to="{ name: 'unpublishProject' }"><v-icon left small>mdi-cloud-off-outline</v-icon>Unpublish</v-btn>
                <v-btn small rounded v-if="isOwner || !project.id" :to="{ name: 'publishProject' }"><v-icon left small>mdi-cloud-upload-outline</v-icon>Publish</v-btn>
              </v-card-actions>
            </v-card>
            <v-card width="475" class="mb-3" v-if="ready">
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
                <v-btn icon small @click="tabs.collapse = !tabs.collapse" class="align-self-center mr-1">
                  <v-icon small v-if="!tabs.collapse">mdi-menu-up</v-icon>
                  <v-icon small v-else>mdi-menu-down</v-icon>
                </v-btn>

                <!-- Map Variables -->
                <v-tab-item :transition="false" :reverse-transition="false">
                  <v-card :max-height="maxHeight" style="overflow-y: auto" v-show="!tabs.collapse">
                    <v-card-text>
                      <v-autocomplete
                        v-model="color.selected"
                        label="Color By"
                        item-value="id"
                        item-text="name"
                        return-object
                        clearable
                        outlined
                        hide-details
                        @change="selectOption"
                        :items="color.options">
                      </v-autocomplete>
                      <v-autocomplete
                        v-model="size.selected"
                        label="Size By"
                        item-value="id"
                        item-text="name"
                        return-object
                        clearable
                        outlined
                        hide-details
                        class="my-4"
                        @change="selectOption"
                        :items="size.options">
                      </v-autocomplete>
                      <v-autocomplete
                        v-model="outline.selected"
                        label="Outline By"
                        item-value="id"
                        item-text="name"
                        return-object
                        clearable
                        outlined
                        hide-details
                        @change="selectOption"
                        :items="outline.options">
                      </v-autocomplete>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-text>
                      <div class="subtitle-2">
                        Display Settings
                      </div>
                      <v-row>
                        <v-col cols="5" class="pb-0">
                          <div class="body-1 grey--text text--darken-2 pt-1">
                            Unselected Opacity
                          </div>
                        </v-col>
                        <v-col cols="7" class="pb-0">
                          <v-slider
                            v-model="map.opacityUnselected"
                            hide-details
                            :min="0"
                            :max="1"
                            :step="0.01">
                            <template v-slot:append>
                              <div class="mt-1 caption grey--text text--darken-2" style="width:40px">
                                {{map.opacityUnselected}}
                              </div>
                            </template>
                          </v-slider>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <!-- Selection -->
                <v-tab-item :transition="false" :reverse-transition="false">
                  <v-card :max-height="maxHeight" style="overflow-y: auto" v-show="!tabs.collapse">
                    <v-card-text>
                      <div class="d-flex">
                        <div class="subtitle-1 align-self-center">
                          # Selected Individuals: <span class="black--text">{{ selected.ids.length }}</span>
                        </div>
                        <v-spacer></v-spacer>
                        <v-tooltip right open-delay="100" max-width="400">
                          <template v-slot:activator="{ on }">
                            <v-btn small icon v-on="on" class="align-self-center">
                              <v-icon>mdi-alert-circle</v-icon>
                            </v-btn>
                          </template>
                          Click a point on the map to select an individual (unique tag ID),
                          which will highlight all locations that individual was observed.
                          Click on a selected individual to unselect it.
                          More than one individual can be selected at a time.
                        </v-tooltip>
                      </div>

                      <div class="my-4">
                        <v-btn small @click="unselectAll" rounded :disabled="selected.ids.length === 0">
                          <v-icon small left>mdi-delete</v-icon> Unselect All
                        </v-btn>
                      </div>

                      <v-divider class="my-3"></v-divider>

                      <div class="d-flex">
                        <div class="subtitle-1 align-self-center">
                          # Selection Areas: <span class="black--text">{{ draw.count }}</span>
                        </div>
                        <v-spacer></v-spacer>
                        <v-tooltip right open-delay="100" max-width="400">
                          <template v-slot:activator="{ on }">
                            <v-btn icon small v-on="on" class="align-self-center">
                              <v-icon>mdi-alert-circle</v-icon>
                            </v-btn>
                          </template>
                          Select all individuals that were observed in a specific area by clicking <strong>Draw New Area</strong>
                          and then click-and-drag to draw the target area on the map.

                          Add more areas to select individuals that passed through multiple areas.

                          <strong>Intersection</strong> selects individuals that passed through ALL areas, <strong>Union</strong> selects individuals
                          that passed through ANY of the areas.

                          These selections are not affected by the crossfilters.
                        </v-tooltip>
                      </div>

                      <div class="my-3">
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
                        <v-btn small rounded @click="toggleDraw" v-if="!draw.enabled">
                          <v-icon small left>mdi-selection-drag</v-icon> Draw New Area
                        </v-btn>
                        <v-btn small rounded @click="toggleDraw" v-else>
                          <v-icon small left>mdi-close</v-icon> Cancel
                        </v-btn>
                        <v-btn small rounded @click="clearDraw" class="ml-3" :disabled="draw.count === 0">
                          <v-icon small left>mdi-delete</v-icon> Clear All
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <!-- Filter -->
                <v-tab-item :transition="false" :reverse-transition="false">
                  <v-card :max-height="maxHeight" style="overflow-y: auto" v-show="!tabs.collapse">
                    <v-card-text>
                      <v-autocomplete
                        :items="filters.options"
                        v-model="filters.selected"
                        multiple
                        dense
                        return-object
                        outlined
                        item-value="id"
                        item-text="name"
                        chips
                        small-chips
                        deletable-chips
                        clearable
                        hide-details
                        class="mb-4"
                        label="Select filter variable(s)...">
                      </v-autocomplete>
                      <p v-if="filters.selected.length === 0" class="subheading mt-2">
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
          </v-col>
          <v-spacer></v-spacer>
          <v-col>
            <TameLegend
              :counts="counts"
              :color-variable="color.selected"
              :size-variable="size.selected"
              :outline-variable="outline.selected"
              v-if="ready"></TameLegend>
          </v-col>
        </v-row>
      </v-container>
      <v-dialog  scrollable v-model="showDialog" :max-width="$route.meta.width || 1000" @input="$router.push('/')">
        <router-view></router-view>
      </v-dialog>
    </v-content>
    <v-content v-else>
      <v-alert type="error" class="ma-8" outlined prominent color="grey darken-1">
        <div class="title">TAME is not designed for mobile devices.</div>
        Please use a laptop or desktop with a larger screen size (>960px wide).
      </v-alert>
    </v-content>

    <!-- USGS footer -->
    <UsgsFooter v-if="usgs"></UsgsFooter>
  </v-app>
</template>

<script>
import * as d3 from 'd3'
import L from 'leaflet'
import { mapGetters, mapActions } from 'vuex'

import evt from '@/events'
import { xf } from '@/crossfilter'

import UsgsHeader from '@/components/usgs/UsgsHeader'
import UsgsFooter from '@/components/usgs/UsgsFooter'

import TameAppBar from '@/components/TameAppBar'
import TameMap from '@/components/TameMap'
import TameMapLayer from '@/components/TameMapLayer'
import TameFilter from '@/components/TameFilter'
import TameLegend from '@/components/TameLegend'

export default {
  name: 'App',
  components: {
    UsgsHeader,
    UsgsFooter,
    TameAppBar,
    TameMap,
    TameMapLayer,
    TameFilter,
    TameLegend
  },
  data: () => ({
    showDialog: true,
    loading: false,
    ready: false,
    error: null,
    dataset: [],
    tabs: {
      active: 0,
      collapse: false
    },
    map: {
      center: [35, -92.8],
      zoom: 5,
      opacityUnselected: 0.3,
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
          name: 'USGS Topo',
          visible: false,
          url: 'https://basemap.nationalmap.gov/ArcGIS/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
          attribution: '<a href="http://www.doi.gov">U.S. Department of the Interior</a> | <a href="http://www.usgs.gov">U.S. Geological Survey</a> | <a href="http://www.usgs.gov/laws/policies_notices.html">Policies</a>'
        },
        {
          name: 'USGS Hydrography',
          visible: false,
          url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSHydroCached/MapServer/tile/{z}/{y}/{x}',
          attribution: '<a href="http://www.doi.gov">U.S. Department of the Interior</a> | <a href="http://www.usgs.gov">U.S. Geological Survey</a> | <a href="http://www.usgs.gov/laws/policies_notices.html">Policies</a>'
        },
        {
          name: 'USGS Imagery',
          visible: false,
          url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
          attribution: '<a href="http://www.doi.gov">U.S. Department of the Interior</a> | <a href="http://www.usgs.gov">U.S. Geological Survey</a> | <a href="http://www.usgs.gov/laws/policies_notices.html">Policies</a>'
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
      // visible: process.env.NODE_ENV === 'development',
      visible: false,
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
    ...mapGetters(['user', 'project', 'isOwner', 'usgs']),
    maxHeight () {
      return (this.$vuetify.breakpoint.height - 279 - (this.usgs ? 72 + 59 : 0)) + 'px'
    },
    colorScale () {
      if (!this.project) return null
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
      if (!this.project) return null
      return d3.scaleOrdinal(['orangered', 'white'])
        .domain(this.outline.selected.domain)
    },
    sizeScale () {
      if (!this.project) return null
      return d3.scaleLinear()
        .domain(this.size.selected.domain)
        .range([0.1, 1])
        .clamp(true)
    }
  },
  watch: {
    '$route' (newVal) {
      console.log('watch:$route', newVal)
      this.showDialog = newVal.path !== '/'
    },
    // 'color.selected' () {
    //   evt.$emit('map:render')
    // },
    // 'outline.selected' () {
    //   evt.$emit('map:render')
    // },
    // 'size.selected' () {
    //   evt.$emit('map:render')
    // },
    'draw.operation' () {
      this.onDraw()
    },
    project () {
      this.resetProject()
    }
  },
  mounted () {
    evt.$on('filter', this.onFilter)
    if (this.$route.name === 'home' && !this.project) {
      this.$router.push('/welcome')
    }
  },
  beforeDestroy () {
    xf.remove(() => true)
    evt.$off('filter', this.onFilter)
  },
  methods: {
    ...mapActions(['loadProject']),
    closeDialog () {
      this.showDialog = false
      setTimeout(() => {
        this.$router.push('/')
      }, 200)
    },
    // logout () {
    //   this.$Amplify.Auth.signOut()
    //     .then(() => {
    //       return AmplifyEventBus.$emit('authState', { state: 'signedOut' })
    //     })
    //     .catch((e) => {
    //       console.log(e)
    //       alert('Error occurred trying to log out')
    //     })
    // },
    selectOption () {
      console.log('selectOption')
      evt.$emit('map:render')
    },
    clearProject () {
      console.log('clearProject')
      this.unselectAll()
      if (this.draw.enabled) {
        this.clearDraw()
        this.toggleDraw()
      }
      if (this.tags.group) {
        this.tags.group.dispose()
        this.tags.group = null
      }
      if (this.tags.dim) {
        this.tags.dim.dispose()
        this.tags.dim = null
      }
      xf.remove(d => true)
      this.dataset = []
      this.color.selected = null
      this.color.options = []
      this.size.selected = null
      this.size.options = []
      this.outline.selected = null
      this.outline.options = []
      this.filters.selected = []
      this.filters.options = []
      this.ready = false
      evt.$emit('filter')
      evt.$emit('map:render')
    },
    closeProject () {
      this.loadProject()
        .then(() => this.clearProject())
        .then(() => {
          this.$router.push({ name: 'welcome' })
        })
    },
    resetProject () {
      console.log('resetProject', this.project)
      this.clearProject()
      this.$nextTick(this.initProject)
    },
    initProject () {
      console.log('initProject', this.project)

      if (!this.project) return

      const { columns, variables, dataset } = this.project
      const data = dataset.data

      // const timeParser = d3.utcParse('%Y-%m-%dT%H:%M:%SZ')
      const numericVariables = variables.filter(d => d.type === 'continuous').map(d => d.id)

      data.forEach((row, index) => {
        row.$index = index
        // row[columns.datetime] = timeParser(row[columns.datetime])
        row[columns.datetime] = new Date(row[columns.datetime])
        row[columns.latitude] = +row[columns.latitude]
        row[columns.longitude] = +row[columns.longitude]
        numericVariables.forEach(v => {
          row[v] = +row[v]
        })
      })

      // const groupByTag = d3.nest()
      //   .key(d => d[columns.id])
      //   .sortValues((a, b) => (a[columns.datetime] < b[columns.datetime] ? -1 : a[columns.datetime] > b[columns.datetime] ? 1 : a[columns.datetime] >= b[columns.datetime] ? 0 : NaN))
      //   .entries(data)

      // const mapByIndex = new Map()
      // groupByTag.forEach(d => {
      //   const n = d.values.length

      //   if (n <= 1) return

      //   for (let i = 0; i < (n - 1); i++) {
      //     const start = d.values[i]
      //     const end = d.values[i + 1]

      //     const days = (end[columns.datetime] - start[columns.datetime]) / 1000 / 86400
      //     const meters = L.latLng(start[columns.latitude], start[columns.longitude]).distanceTo([end[columns.latitude], end[columns.longitude]])

      //     const velocity = meters / days

      //     mapByIndex.set(start.$index, {
      //       '$duration': days,
      //       '$distance': meters,
      //       '$velocity': velocity
      //     })
      //   }

      //   mapByIndex.set(d.values[n - 1].$index, {
      //     '$duration': null,
      //     '$distance': null,
      //     '$velocity': null
      //   })
      // })

      // this.dataset = data.map(d => ({
      //   ...d,
      //   ...mapByIndex.get(d.$index)
      // }))

      this.dataset = Object.freeze(data)

      this.tags.dim = xf.dimension(d => d[columns.id])
      this.tags.group = this.tags.dim.group().reduceCount()

      // const velocityDomain = [
      //   d3.quantile(this.dataset, 0.05, d => d.$velocity),
      //   d3.quantile(this.dataset.filter(d => isFinite(d.$velocity)), 0.9, d => d.$velocity)
      // ]
      // const velocityDomain = [0, d3.quantile(this.dataset.filter(d => isFinite(d.$velocity)), 0.9, d => d.$velocity)]

      xf.add(this.dataset)

      this.color.options = [
        {
          id: columns.id,
          name: 'Individual ID',
          type: 'discrete',
          domain: [...new Set(data.map(d => d[columns.id]))].sort(d3.ascending)
        },
        ...variables.filter(d => d.color)
      ]
      this.outline.options = variables.filter(d => d.outline)
      this.size.options = variables.filter(d => d.size)
      this.filters.options = [
        {
          id: 'datetime',
          name: 'Date',
          type: 'datetime'
        },
        // {
        //   id: '$velocity',
        //   name: 'Velocity (m/day)',
        //   type: 'continuous',
        //   domain: [Math.floor(velocityDomain[0]), Math.ceil(velocityDomain[1])]
        // },
        // {
        //   id: '$distance',
        //   name: 'Distance to Next Location (m)',
        //   type: 'continuous',
        //   domain: [0, Math.ceil(d3.max(this.dataset, d => d.$distance))]
        // },
        // {
        //   id: '$duration',
        //   name: 'Time to Next Location (days)',
        //   type: 'continuous',
        //   domain: [0, Math.ceil(d3.max(this.dataset, d => d.$duration))]
        // },
        ...variables.filter(d => d.filter)
      ]

      this.color.selected = this.color.options.length > 0 ? this.color.options[0] : null
      this.outline.selected = this.outline.options.length > 0 ? this.outline.options[0] : null
      this.size.selected = this.size.options.length > 0 ? this.size.options[0] : null
      this.filters.selected = [this.filters.options[0]]

      this.selectOption()
      this.ready = true
      evt.$emit('filter')
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

      this.counts.tags.filtered = this.tags.group ? this.tags.group.all().filter(d => d.value > 0).length : 0
      this.counts.tags.total = this.tags.group ? this.tags.group.size() : 0
    },
    selectByAreas (layer) {
      console.log('selectByAreas', layer, layer.features[0])
      if (!layer || layer.features.length === 0) {
        this.selected.ids = []
        return
      }
      const allRows = xf.all()
      if (this.draw.operation === 'intersection') {
        this.selected.ids = this.selectByAreasIntersection(allRows, layer)
      } else if (this.draw.operation === 'union') {
        this.selected.ids = this.selectByAreasUnion(allRows, layer)
      } else {
        alert('Invalid area selection operation')
      }
    },
    selectByAreasIntersection (allRows, layer) {
      let rows = allRows
      let ids = [...new Set(allRows.map(d => d[this.project.columns.id]))]
      console.log(ids)
      layer.features.forEach((feature, i) => {
        rows = this.pointsInArea(allRows.filter(d => ids.includes(d[this.project.columns.id])), feature)
        ids = [...new Set(rows.map(d => d[this.project.columns.id]))]
      })
      return ids
    },
    selectByAreasUnion (allRows, layer) {
      const rows = this.pointsInArea(allRows, layer)
      return [...new Set(rows.map(d => d[this.project.columns.id]))]
    },
    pointsInArea (points, feature) {
      return points.filter(d => d3.geoContains(feature, [d[this.project.columns.longitude], d[this.project.columns.latitude]]))
    },
    selectId (id) {
      console.log('app:selectId', id, this.selected.ids.includes(id))
      if (this.selected.ids.includes(id)) {
        const index = this.selected.ids.findIndex(d => d === id)
        if (index > -1) {
          this.selected.ids.splice(index, 1)
        }
        console.log(index, this.selected.ids)
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
      console.log('onDraw', this.draw.layer, this.draw.layer.toGeoJSON())
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
    },
    deleteProject () {
      console.log('deleteProject')
      // this.loadProject()
      //   .then(() => {
      //     this.$router.push({ name: 'welcome' })
      //   })
    }
  }
}
</script>

<style>
/* .v-dialog:not(.v-dialog--fullscreen) {
  position: absolute;
  top: 0;
} */
.v-dialog__content.v-dialog__content--active {
  align-items: start;
}
.v-dialog--scrollable > .v-card > .v-stepper {
  overflow-y: auto;
}
</style>
