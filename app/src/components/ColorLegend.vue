<template>
  <div>
    <div class="my-2 font-weight-bold grey--text text--darken-2 d-flex">
      <div class="d-flex align-self-end">
        <span class="pr-1">Color:</span> <span v-if="variable">{{ variable.name }}</span><span v-else>None</span>
      </div>
      <v-spacer></v-spacer>
      <div>
        <v-menu v-model="settings" :close-on-content-click="false" nudge-left="620px">
          <template v-slot:activator="{ on }">
            <v-btn height="24" width="24" icon small v-on="on" :disabled="!variable">
              <v-icon small>mdi-settings</v-icon>
            </v-btn>
          </template>
          <v-card width="400">
            <v-toolbar color="grey darken-2" dense dark height="32">
              <div class="subtitle-1 font-weight-bold">Color Settings</div>
              <v-spacer></v-spacer>
              <v-btn icon small @click="settings = false">
                <v-icon small>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text v-if="!variable">
              No Variable Selected
            </v-card-text>
            <v-card-text v-else-if="variable.type === 'continuous'">
              <ContinuousColorSettings></ContinuousColorSettings>
            </v-card-text>
            <v-card-text v-else-if="variable.type === 'discrete'">
              <DiscreteColorSettings></DiscreteColorSettings>
            </v-card-text>
          </v-card>
        </v-menu>
      </div>
    </div>
    <div v-if="variable">
      <ContinuousColorLegend v-if="variable.type === 'continuous'"></ContinuousColorLegend>
      <DiscreteColorLegend v-else-if="variable.type === 'discrete'"></DiscreteColorLegend>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ContinuousColorLegend from '@/components/ContinuousColorLegend'
import ContinuousColorSettings from '@/components/ContinuousColorSettings'
import DiscreteColorLegend from '@/components/DiscreteColorLegend'
import DiscreteColorSettings from '@/components/DiscreteColorSettings'

export default {
  name: 'ColorLegend',
  components: {
    ContinuousColorLegend,
    ContinuousColorSettings,
    DiscreteColorLegend,
    DiscreteColorSettings
  },
  data () {
    return {
      settings: false
    }
  },
  computed: {
    ...mapGetters({
      variable: 'colorVariable'
    })
  }
}
</script>
