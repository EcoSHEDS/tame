<template>
  <v-card
    style="position:absolute;top:8px;right:8px;"
    width="260">
    <v-toolbar dense dark color="primary" height="32">
      <span class="subtitle-1 font-weight-bold">Legend</span>
      <v-spacer></v-spacer>
      <v-btn icon small @click="collapse = !collapse">
        <v-icon small v-if="!collapse">mdi-menu-up</v-icon>
        <v-icon small v-else>mdi-menu-down</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text v-show="!collapse" :style="{ 'max-height': maxHeight, 'overflow-y': 'auto'}">
      <div class="grey--text text--darken-2">
        <h4>Filter Summary</h4>
        <div class="pl-2">
          Obs.:
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
      <ColorLegend :variable="colorVariable"></ColorLegend>
      <TameLegendSize :variable="sizeVariable"></TameLegendSize>
      <TameLegendOutline :variable="outlineVariable"></TameLegendOutline>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'

import ColorLegend from '@/components/ColorLegend'
import TameLegendSize from '@/components/TameLegendSize'
import TameLegendOutline from '@/components/TameLegendOutline'

export default {
  name: 'TameLegend',
  props: ['counts', 'colorVariable', 'sizeVariable', 'outlineVariable'],
  components: {
    ColorLegend,
    TameLegendSize,
    TameLegendOutline
  },
  data () {
    return {
      collapse: false
    }
  },
  computed: {
    ...mapGetters(['usgs']),
    maxHeight () {
      return (this.$vuetify.breakpoint.height - 112 - (this.usgs ? 68 + 59 : 0)) + 'px'
    }
  }
}
</script>

<style>

</style>
