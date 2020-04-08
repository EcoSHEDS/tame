<template>
  <v-app>
    <!-- USGS header -->
    <UsgsHeader v-if="usgs"></UsgsHeader>

    <TameAppBar v-if="$vuetify.breakpoint.mdAndUp"></TameAppBar>
    <v-app-bar app dense clipped-left dark absolute :style="{'margin-top': usgs ? '68px' : '0'}" v-else>
      <v-toolbar-title class="subheading">
        <span>Tagged Animal Movement Explorer (TAME)</span>
        <span class="text-uppercase overline ml-3">Beta</span>
      </v-toolbar-title>
    </v-app-bar>

    <v-content v-if="$vuetify.breakpoint.mdAndUp">
      <v-snackbar
        top
        v-model="snackbar.show"
        :timeout="snackbar.timeout">
        <v-icon small left dark>mdi-alert</v-icon>{{snackbar.text}}
        <v-btn
          color="blue"
          text
          @click="snackbar.show = false">
          Close
        </v-btn>
      </v-snackbar>
      <TameMap :center="map.center" :zoom="map.zoom" :basemaps="map.basemaps" @ready="mapIsReady">
        <TameMapLayerCanvas
          v-if="ready"
          :dataset="dataset"
          :getColor="getColor"
          :getOutline="getOutline"
          :getSize="getSize"
          :selected-ids="selection.selected"
          :transparency="map.transparency"
          :jitter-x="map.jitter.x"
          :jitter-y="map.jitter.y"
          :hover-color="map.hoverColor"
          :show-circles="map.showCircles"
          :show-vectors="map.showVectors"
          @click="selectId">
          </TameMapLayerCanvas>
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
                    {{ project ? project.name : 'None' | truncate(40) }}
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
                  <v-icon small class="mr-1">mdi-map</v-icon> Map
                </v-tab>
                <v-tab ripple>
                  <v-icon small class="mr-1">mdi-crosshairs-gps</v-icon> Selection
                </v-tab>
                <v-tab ripple>
                  <v-icon small class="mr-1">mdi-chart-bar</v-icon> Crossfilters
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
                        :items="color.options"
                        label="Color Variable"
                        item-value="id"
                        item-text="name"
                        return-object
                        clearable
                        outlined
                        dense
                        hide-details
                        @change="changeColor">
                      </v-autocomplete>
                      <v-autocomplete
                        v-model="size.selected"
                        label="Size Variable"
                        item-value="id"
                        item-text="name"
                        return-object
                        clearable
                        outlined
                        dense
                        hide-details
                        class="mt-4"
                        @change="selectOption"
                        :items="size.options">
                      </v-autocomplete>
                      <v-autocomplete
                        v-model="outline.selected"
                        label="Outline Variable"
                        item-value="id"
                        item-text="name"
                        return-object
                        clearable
                        outlined
                        dense
                        hide-details
                        class="mt-4"
                        @change="selectOption"
                        :items="outline.options">
                      </v-autocomplete>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-text>
                      <v-row no-gutters>
                        <v-col cols="11" class="py-0">
                          <span class="subtitle-1">Display Settings</span>
                        </v-col>
                        <v-col cols="1" class="py-0 text-right">
                          <v-btn icon small @click="showDisplaySettings = !showDisplaySettings" class="align-self-center">
                            <v-icon small v-if="!showDisplaySettings">mdi-menu-up</v-icon>
                            <v-icon small v-else>mdi-menu-down</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                      <div v-if="showDisplaySettings">
                        <v-row no-gutters class="my-2">
                          <v-col cols="5" class="pb-0">
                            <div class="subtitle-2 grey--text text--darken-2 pt-1">
                              Transparency
                            </div>
                          </v-col>
                          <v-col cols="6" class="pb-0">
                            <v-slider
                              v-model="map.transparency"
                              hide-details
                              :min="0"
                              :max="1"
                              :step="0.01">
                              <template v-slot:append>
                                <div class="mt-1 caption grey--text text--darken-2" style="width:50px">
                                  {{map.transparency}}
                                </div>
                              </template>
                            </v-slider>
                          </v-col>
                          <v-col cols="1" class="text-right">
                            <v-tooltip right open-delay="100" max-width="400">
                              <template v-slot:activator="{ on }">
                                <v-btn small icon v-on="on" class="align-self-center">
                                  <v-icon small>mdi-alert-circle-outline</v-icon>
                                </v-btn>
                              </template>
                              Adjust the transparency of circles and movement vectors. Does not affect selected or hovered individuals.<br><br>
                              When one or more individuals are selected, transparency is automatically increased for the unselected individuals.
                            </v-tooltip>
                          </v-col>
                        </v-row>
                        <!-- <v-alert color="orange" text dense dismissable border="left" class="mb-0 body-2" :value="map.transparency < 0.25 && selection.selected.length === 0">
                          <div class="font-weight-medium"><v-icon color="orange" left small>mdi-information</v-icon> Map may appear empty due to low transparency</div>
                        </v-alert> -->
                        <v-row no-gutters class="my-2">
                          <v-col cols="5" class="pb-0">
                            <div class="subtitle-2 grey--text text--darken-2 pt-1">
                              Horizontal Jitter
                            </div>
                          </v-col>
                          <v-col cols="6" class="pb-0">
                            <v-slider
                              v-model="map.jitter.x"
                              hide-details
                              :min="0"
                              :max="1"
                              :step="0.01">
                              <template v-slot:append>
                                <div class="mt-1 caption grey--text text--darken-2" style="width:50px">
                                  {{map.jitter.x}}
                                </div>
                              </template>
                            </v-slider>
                          </v-col>
                          <v-col cols="1" class="text-right">
                            <v-tooltip right open-delay="100" max-width="400">
                              <template v-slot:activator="{ on }">
                                <v-btn small icon v-on="on" class="align-self-center">
                                  <v-icon small>mdi-alert-circle-outline</v-icon>
                                </v-btn>
                              </template>
                              Add horizontal jitter (random variation) to circles
                            </v-tooltip>
                          </v-col>
                        </v-row>
                        <v-row no-gutters class="my-2">
                          <v-col cols="5" class="pb-0">
                            <div class="subtitle-2 grey--text text--darken-2 pt-1">
                              Vertical Jitter
                            </div>
                          </v-col>
                          <v-col cols="6" class="pb-0">
                            <v-slider
                              v-model="map.jitter.y"
                              hide-details
                              :min="0"
                              :max="1"
                              :step="0.01">
                              <template v-slot:append>
                                <div class="mt-1 caption grey--text text--darken-2" style="width:50px">
                                  {{map.jitter.y}}
                                </div>
                              </template>
                            </v-slider>
                          </v-col>
                          <v-col cols="1" class="text-right">
                            <v-tooltip right open-delay="100" max-width="400">
                              <template v-slot:activator="{ on }">
                                <v-btn small icon v-on="on" class="align-self-center">
                                  <v-icon small>mdi-alert-circle-outline</v-icon>
                                </v-btn>
                              </template>
                              Add vertical jitter (random variation) to circles
                            </v-tooltip>
                          </v-col>
                        </v-row>

                        <v-divider></v-divider>

                        <v-row no-gutters class="my-2">
                          <v-col cols="8" class="pb-0">
                            <div class="subtitle-2 grey--text text--darken-2 pt-1">
                              Show Circles
                            </div>
                          </v-col>
                          <v-col cols="3" class="pb-0">
                            <div>
                              <v-radio-group dense v-model="map.showCircles" column hide-details class="mt-0">
                                <v-radio :value="2" class="mb-0">
                                  <template slot="label"><span class="caption grey--text text--darken-2">Always</span></template>
                                </v-radio>
                                <v-radio :value="1" class="mb-0">
                                  <template slot="label"><span class="caption grey--text text--darken-2">Selected Only</span></template>
                                </v-radio>
                                <v-radio :value="0" class="mb-0">
                                  <template slot="label"><span class="caption grey--text text--darken-2">Never</span></template>
                                </v-radio>
                              </v-radio-group>
                            </div>
                          </v-col>
                          <v-col cols="1" class="text-right">
                            <v-tooltip right open-delay="100" max-width="400">
                              <template v-slot:activator="{ on }">
                                <v-btn small icon v-on="on" class="mt-1">
                                  <v-icon small>mdi-alert-circle-outline</v-icon>
                                </v-btn>
                              </template>
                              Circles indicate the observed locations of each individual.<br><br>
                              They can be be shown always, never, or only for selected individuals.
                            </v-tooltip>
                          </v-col>
                        </v-row>

                        <v-divider></v-divider>

                        <v-row no-gutters class="my-2">
                          <v-col cols="8" class="pb-0">
                            <div class="subtitle-2 grey--text text--darken-2 pt-1">
                              Show Movement Vectors
                            </div>
                          </v-col>
                          <v-col cols="3" class="pb-0">
                            <div>
                              <v-radio-group dense v-model="map.showVectors" column class="mt-0" hide-details>
                                <v-radio :value="2" class="mb-0">
                                  <template slot="label"><span class="caption grey--text text--darken-2">Always</span></template>
                                </v-radio>
                                <v-radio :value="1" class="mb-0">
                                  <template slot="label"><span class="caption grey--text text--darken-2">Selected Only</span></template>
                                </v-radio>
                                <v-radio :value="0" class="mb-0">
                                  <template slot="label"><span class="caption grey--text text--darken-2">Never</span></template>
                                </v-radio>
                              </v-radio-group>
                            </div>
                          </v-col>
                          <v-col cols="1" class="text-right">
                            <v-tooltip right open-delay="100" max-width="400">
                              <template v-slot:activator="{ on }">
                                <v-btn small icon v-on="on" class="mt-1">
                                  <v-icon small>mdi-alert-circle-outline</v-icon>
                                </v-btn>
                              </template>
                              Vectors indicate the movement of individuals from one observed location to another.<br><br>
                              Each vector is associated with its <span class="font-weight-bold">starting point</span>, with both sharing the
                              same color and crossfilter behavior.<br><br>
                              They can be be shown always, never, or only for selected individuals.
                            </v-tooltip>
                          </v-col>
                        </v-row>
                        <v-alert color="orange" text dense dismissible border="left" class="mb-2 body-2" :value="map.showCircles === 0 && map.showVectors === 0">
                          <div class="font-weight-medium"><v-icon color="orange" left small>mdi-alert</v-icon> Map is empty b/c circles and vectors are never shown</div>
                        </v-alert>
                        <v-alert color="orange" text dense dismissible border="left" class="mb-2 body-2" :value="(map.showCircles + map.showVectors > 0) && map.showCircles <= 1 && map.showVectors <= 1 && selection.selected.length === 0">
                          <div class="font-weight-medium"><v-icon color="orange" left small>mdi-alert</v-icon> Map is empty b/c no individuals are selected</div>
                        </v-alert>

                        <v-divider></v-divider>

                        <v-row no-gutters class="mt-2">
                          <v-col cols="8" class="pb-0">
                            <div class="subtitle-2 grey--text text--darken-2 pt-1">
                              Color <span class="font-weight-medium" style="color:deepskyblue">Before</span>/<span class="font-weight-medium" style="color:orangered">After</span> Vector on Hover
                            </div>
                          </v-col>
                          <v-col cols="3" class="pb-0">
                            <v-switch
                              v-model="map.hoverColor"
                              hide-details
                              class="mt-0">
                              <template v-slot:append>
                                <div class="mt-1 caption grey--text text--darken-2" style="width:50px">
                                  {{map.hoverColor ? 'On' : 'Off'}}
                                </div>
                              </template>
                            </v-switch>
                          </v-col>
                          <v-col cols="1" class="text-right">
                            <v-tooltip right open-delay="100" max-width="400">
                              <template v-slot:activator="{ on }">
                                <v-btn small icon v-on="on" class="mt-1">
                                  <v-icon small>mdi-alert-circle-outline</v-icon>
                                </v-btn>
                              </template>
                              When the mouse is hovered over an observed location (circle),
                              the movement lines connecting observations before that point will be colored
                              <span class="font-weight-medium" style="color:deepskyblue">BLUE</span>,
                              and afterwards <span class="font-weight-medium" style="color:orangered">RED</span>.
                            </v-tooltip>
                          </v-col>
                        </v-row>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <!-- Selection -->
                <v-tab-item :transition="false" :reverse-transition="false">
                  <v-card :max-height="maxHeight" style="overflow-y: auto" v-show="!tabs.collapse">
                    <v-card-text>
                      <v-row no-gutters>
                        <v-col cols="10">
                          <div class="subtitle-1 mb-2">
                            Selected Individuals
                          </div>
                        </v-col>
                        <v-col cols="2">
                          <v-tooltip right open-delay="100" max-width="400">
                            <template v-slot:activator="{ on }">
                              <v-btn small icon v-on="on" class="float-right">
                                <v-icon>mdi-alert-circle-outline</v-icon>
                              </v-btn>
                            </template>
                            Click an observed location (circle) on the map or choose an ID from the dropdown menu to
                            select an individual with a unique tag ID, which will highlight all locations where that individual was observed.<br>
                            Click on a selected individual again or uncheck it in the dropdown menu to unselect it.<br>
                            More than one individual can be selected at a time.
                          </v-tooltip>
                        </v-col>
                      </v-row>
                      <v-autocomplete
                        :items="selection.options"
                        v-model="selection.selected"
                        multiple
                        dense
                        outlined
                        item-value="id"
                        item-text="id"
                        clearable
                        hide-details
                        label="Select tag ID(s)...">
                        <template v-slot:selection="{ item, index }">
                          <v-chip close small v-if="index < 10" @click:close="selectId(item.id)">
                            <span>{{ item.id }}</span>
                          </v-chip>
                          <span
                            v-if="index === 10"
                            class="grey--text caption"
                          >(+{{ selection.selected.length - 1 }} more)</span>
                        </template>
                      </v-autocomplete>

                      <v-divider class="my-4"></v-divider>

                      <div class="d-flex">
                        <div class="subtitle-1 align-self-center">
                          # Selection Areas: <span class="black--text">{{ draw.count }}</span>
                        </div>
                        <v-spacer></v-spacer>
                        <v-tooltip right open-delay="100" max-width="400">
                          <template v-slot:activator="{ on }">
                            <v-btn icon small v-on="on" class="align-self-center">
                              <v-icon>mdi-alert-circle-outline</v-icon>
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
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <!-- Filter -->
                <v-tab-item :transition="false" :reverse-transition="false">
                  <v-card :max-height="maxHeight" style="overflow-y: auto" v-show="!tabs.collapse">
                    <v-card-text class="mb-0 pb-0">
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
                    </v-card-text>

                    <v-divider class="my-0 py-0" v-if="filters.selected.length > 0"></v-divider>

                    <v-card-text class="mt-0 py-0" v-if="filters.selected.length > 0">
                      <TameFilter
                        v-for="variable in filters.selected"
                        :key="variable.id"
                        :variable="variable"
                        :selectedIds="selection.selected"
                        @close="removeFilter(variable)">
                      </TameFilter>
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
      <v-dialog scrollable v-model="showDialog" :persistent="!!$route.meta.persistent" :max-width="$route.meta.width || 1000" @input="$router.push('/')">
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
import { processDataset } from '@/lib/dataset'

import UsgsHeader from '@/components/usgs/UsgsHeader'
import UsgsFooter from '@/components/usgs/UsgsFooter'

import TameAppBar from '@/components/TameAppBar'
import TameMap from '@/components/TameMap'
import TameMapLayerCanvas from '@/components/TameMapLayerCanvas'
import TameFilter from '@/components/TameFilter'
import TameLegend from '@/components/TameLegend'

window.d3 = d3

export default {
  name: 'App',
  components: {
    UsgsHeader,
    UsgsFooter,
    TameAppBar,
    TameMap,
    TameMapLayerCanvas,
    TameFilter,
    TameLegend
  },
  data: () => ({
    snackbar: {
      show: false,
      text: '',
      timeout: 5000
    },
    showDialog: true,
    showDisplaySettings: true,
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
      transparency: 0.2,
      jitter: {
        x: 0,
        y: 0
      },
      hoverColor: true,
      showCircles: 2,
      showVectors: 1,
      basemaps: [
        {
          name: 'ESRI World Imagery',
          visible: true,
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        },
        {
          name: 'USGS Imagery',
          visible: false,
          url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
          attribution: '<a href="http://www.doi.gov">U.S. Department of the Interior</a> | <a href="http://www.usgs.gov">U.S. Geological Survey</a> | <a href="http://www.usgs.gov/laws/policies_notices.html">Policies</a>'
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
    },
    selection: {
      options: [],
      selected: []
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
    ...mapGetters(['user', 'project', 'isOwner', 'usgs', 'colorScale']),
    maxHeight () {
      return (this.$vuetify.breakpoint.height - 280 - (this.usgs ? 68 + 59 : 0)) + 'px'
    },
    colorValueScale () {
      // maps raw value to [0, 1] for input to colorScale
      if (!this.color.selected || this.color.selected.type !== 'continuous') return (d) => d
      return d3.scaleLinear()
        .domain(this.color.selected.domain)
        .range([0, 1])
        .clamp(true)
    },
    // colorScale () {
    //   if (!this.project) return null
    //   let valueScale, colorScale, scale
    //   if (this.color.selected && this.color.selected.type === 'continuous') {
    //     valueScale = d3.scaleLinear()
    //       .domain(this.color.selected.domain)
    //       .range([0, 1])
    //       .clamp(true)
    //     colorScale = d3.scaleSequential(d3.interpolateViridis)
    //     scale = (x) => colorScale(valueScale(x))
    //   } else {
    //     scale = d3.scaleOrdinal(d3.schemeCategory10)
    //       .domain(this.color.selected.domain)
    //   }
    //   return scale
    // },
    outlineScale () {
      if (!this.project) return null
      return d3.scaleOrdinal(['orangered', 'white'])
        .domain(this.outline.selected.domain)
    },
    sizeScale () {
      if (!this.project) return null
      return d3.scaleLinear()
        .domain(this.size.selected.domain)
        .range([0.5, 1])
        .clamp(true)
    }
  },
  watch: {
    '$route' (newVal) {
      this.showDialog = newVal.path !== '/'
    },
    'draw.operation' () {
      this.onDraw()
    },
    'selection.selected' () {
      if (this.project && this.selection.selected.length === 0 && this.map.transparency > 0.75) {
        this.showSnackbar('Map may appear empty due to high transparency')
      }
    },
    project () {
      this.resetProject()
    },
    colorScale () {
      evt.$emit('map:render')
    }
  },
  mounted () {
    evt.$on('filter', this.onFilter)
    if (this.$route.name === 'home') {
      if (!this.project) {
        this.$router.push('/welcome')
      } else {
        this.showDialog = false
        this.resetProject()
      }
    }
  },
  beforeDestroy () {
    xf.remove(() => true)
    evt.$off('filter', this.onFilter)
  },
  methods: {
    ...mapActions(['loadProject', 'setColorVariable', 'setColorContinuous', 'setColorDiscrete']),
    closeDialog () {
      this.showDialog = false
      setTimeout(() => {
        this.$router.push('/')
      }, 200)
    },
    changeColor (variable) {
      if (this.color.selected !== variable) {
        this.color.selected = variable
      }
      this.setColorVariable(this.color.selected)
      this.selectOption()
    },
    selectOption () {
      // instead of watching individual option selection
      // which would trigger event 4 times when project first loaded
      evt.$emit('map:render')
    },
    clearProject () {
      // console.log('clearProject')
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

      this.selection.options = []
      this.selection.selected = []
      this.color.selected = null
      this.color.options = []
      this.size.selected = null
      this.size.options = []
      this.outline.selected = null
      this.outline.options = []
      this.filters.selected = []
      this.filters.options = []

      this.map.transparency = 0.2
      this.map.jitter.x = 0
      this.map.jitter.y = 0
      this.map.hoverColor = true
      this.map.showCircles = 2
      this.map.showVectors = 1

      this.setColorContinuous({ scheme: 'Viridis', invert: false })
      this.setColorDiscrete({ scheme: 'Category10' })

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
      // console.log('resetProject', this.project)
      this.clearProject()
      this.$nextTick(this.initProject)
    },
    initProject () {
      // console.log('initProject', this.project)

      if (!this.project) return

      const { columns, variables, dataset } = this.project
      const data = dataset.data

      const processedDataset = processDataset(data, columns, variables)
      this.tags.dim = xf.dimension(d => d[columns.id])
      this.tags.group = this.tags.dim.group().reduceCount()

      xf.add(processedDataset)
      this.dataset = processedDataset

      this.selection.options = this.tags.group.all().map(d => ({ id: d.key }))

      const calculatedByObservation = [
        {
          id: '$doy',
          name: 'Day of the Year',
          type: 'continuous',
          domain: [1, 366],
          tickValues: {
            1: 'Jan 1',
            91: 'Apr 1',
            182: 'Jul 1',
            274: 'Oct 1',
            365: 'Dec 31'
          }
        },
        {
          id: '$distance',
          name: 'Distance to Next Location (m)',
          type: 'continuous',
          domain: [0, Math.ceil(d3.max(processedDataset, d => d.$distance))],
          tickFormat: '.2s'
        },
        {
          id: '$duration',
          name: 'Time to Next Location (days)',
          type: 'continuous',
          domain: [0, Math.ceil(d3.max(processedDataset, d => d.$duration))]
        },
        {
          id: '$velocity',
          name: 'Velocity to Next Location (m/day)',
          type: 'continuous',
          domain: [0, Math.ceil(d3.max(processedDataset, d => d.$velocity))],
          tickFormat: '.2s'
        },
        {
          id: '$bearing',
          name: 'Heading to Next Location (degrees)',
          type: 'continuous',
          domain: [0, 360],
          // tickValues: [0, 90, 180, 270, 360],
          tickValues: {
            0: '0 (N)',
            90: '90 (E)',
            180: '180 (S)',
            270: '270 (W)',
            360: '360 (N)'
          }
        }
      ]
      const calculatedById = [
        {
          id: '$total_n',
          name: 'Total # of Observations',
          type: 'continuous',
          domain: [0, Math.ceil(d3.max(processedDataset, d => d.$total_n))]
        },
        {
          id: '$total_distance',
          name: 'Total Distance (m)',
          type: 'continuous',
          domain: [0, Math.ceil(d3.max(processedDataset, d => d.$total_distance))],
          tickFormat: '.2s'
        },
        {
          id: '$total_distance',
          name: 'Total Distance (m)',
          type: 'continuous',
          domain: [0, Math.ceil(d3.max(processedDataset, d => d.$total_distance))],
          tickFormat: '.2s'
        },
        {
          id: '$total_duration',
          name: 'Total Time (days)',
          type: 'continuous',
          domain: [0, Math.ceil(d3.max(processedDataset, d => d.$total_duration))],
          tickFormat: '.2s'
        }
      ]

      const uniqueIds = [...new Set(data.map(d => d[columns.id]))].sort(d3.ascending)
      this.color.options = [
        { header: 'Individual Metrics' },
        ...[
          {
            id: columns.id,
            name: 'Individual ID',
            type: 'discrete',
            domain: uniqueIds
          },
          ...calculatedById
        ],
        { header: 'Movement Metrics' },
        ...calculatedByObservation
      ]
      const colorVariables = variables.filter(d => !d.skip && d.color)
      if (colorVariables.length > 0) {
        this.color.options = [
          ...this.color.options,
          { header: 'Additional Variables' },
          ...colorVariables
        ]
      }

      this.size.options = [
        { header: 'Individual Metrics' },
        ...calculatedById,
        { header: 'Movement Metrics' },
        ...calculatedByObservation
      ]
      const sizeVariables = variables.filter(d => !d.skip && d.size)
      if (sizeVariables.length > 0) {
        this.size.options = [
          ...this.size.options,
          { header: 'Additional Variables' },
          ...sizeVariables
        ]
      }

      const outlineVariables = variables.filter(d => !d.skip && d.outline)
      if (outlineVariables.length > 0) {
        this.outline.options = [
          { header: 'Additional Variables' },
          ...outlineVariables
        ]
      } else {
        this.outline.options = []
      }

      const idFilterVariable = {
        id: columns.id,
        name: 'Individual ID',
        type: 'id'
      }
      const datetimeFilterVariable = {
        id: 'datetime',
        name: 'Date',
        type: 'datetime'
      }
      this.filters.options = [
        { header: 'Individual Metrics' },
        ...[
          idFilterVariable,
          ...calculatedById
        ],
        { header: 'Movement Metrics' },
        ...[
          datetimeFilterVariable,
          ...calculatedByObservation
        ]
      ]
      const filterVariables = variables.filter(d => !d.skip && d.filter)
      if (filterVariables.length > 0) {
        this.filters.options = [
          ...this.filters.options,
          { header: 'Additional Variables' },
          ...filterVariables
        ]
      }

      // this.color.selected = this.color.options[1]
      this.changeColor(this.color.options[1])
      // this.size.selected = this.size.options[1]
      // this.outline.selected = this.outline.options.length > 0 ? this.outline.options[0] : null

      this.filters.selected = [idFilterVariable, datetimeFilterVariable]

      this.selectOption()
      this.ready = true
      evt.$emit('filter')
    },
    getColor (d, i) {
      if (!d || !this.color.selected || d[this.color.selected.id] === null) {
        return '#888888'
      }
      if (this.color.selected.type === 'continuous' && !isFinite(d[this.color.selected.id])) {
        return null
      }
      return this.colorScale(this.colorValueScale(d[this.color.selected.id]))
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
      // console.log('app:onFilter')
      this.counts.records.filtered = xf.allFiltered().length
      this.counts.records.total = xf.size()

      this.counts.tags.filtered = this.tags.group ? this.tags.group.all().filter(d => d.value > 0).length : 0
      this.counts.tags.total = this.tags.group ? this.tags.group.size() : 0
    },
    selectByAreas (layer) {
      // console.log('selectByAreas', layer, layer.features[0])
      if (!layer || layer.features.length === 0) {
        this.selection.selected = []
        return
      }
      const allRows = xf.all()
      if (this.draw.operation === 'intersection') {
        this.selection.selected = this.selectByAreasIntersection(allRows, layer)
      } else if (this.draw.operation === 'union') {
        this.selection.selected = this.selectByAreasUnion(allRows, layer)
      } else {
        alert('Invalid area selection operation')
      }
    },
    selectByAreasIntersection (allRows, layer) {
      let rows = allRows
      let ids = [...new Set(allRows.map(d => d[this.project.columns.id]))]
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
      // console.log('app:selectId', id, this.selection.selected.includes(id))
      if (this.selection.selected.includes(id)) {
        const index = this.selection.selected.findIndex(d => d === id)
        if (index > -1) {
          this.selection.selected.splice(index, 1)
        }
      } else {
        this.selection.selected.push(id)
      }
    },
    unselectAll () {
      this.selection.selected = []
      this.clearDraw()
    },
    showSnackbar (text, timeout) {
      this.snackbar.timeout = timeout || 5000
      this.snackbar.text = text
      this.snackbar.show = true
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
      if (!this.draw.layer) {
        this.draw.count = 0
        this.draw.enabled = false
        return
      }
      this.draw.count = this.draw.layer.getLayers().length
      this.draw.enabled = false
      // console.log('onDraw', this.draw.layer, this.draw.layer.toGeoJSON())
      this.selectByAreas(this.draw.layer.toGeoJSON())
    },
    clearDraw () {
      // console.log('clearDraw()')
      this.draw.layer && this.draw.layer.eachLayer(d => this.draw.layer.removeLayer(d))
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
.v-dialog__content.v-dialog__content--active {
  align-items: start;
}
.v-dialog--scrollable > .v-card > .v-stepper {
  overflow-y: auto;
}
</style>
