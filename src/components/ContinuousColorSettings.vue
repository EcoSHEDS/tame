<template>
  <div>
    <v-autocomplete
      :items="scheme.options"
      v-model="scheme.selected"
      full-width
      filled
      hide-details
      dense
      label="Select color scheme..."
      @change="update">
      <template v-slot:selection="data">
        <ColorBar :id="`settings-continuous-selected`" type="continuous" :scheme="data.item" :invert="invert" :width="200" :height="18"></ColorBar>
        <span class="ml-4">{{ data.item }}</span>
      </template>
      <template v-slot:item="data">
        <ColorBar :id="`settings-continuous-${data.item}`" type="continuous" :scheme="data.item" :invert="invert" :width="200" :height="18"></ColorBar>
        <span class="ml-4">{{ data.item }}</span>
      </template>
    </v-autocomplete>

    <v-row no-gutters class="mt-4">
      <v-col cols="7" class="pb-0 pt-1">
        <div class="subtitle-2 grey--text text--darken-2">
          Invert Color Scheme
        </div>
      </v-col>
      <v-col cols="5" class="pb-0">
        <v-switch
          v-model="invert"
          hide-details
          class="float-right mt-0"
          @change="update">
          <template v-slot:append>
            <div class="mt-1 caption grey--text text--darken-2" style="width:40px">
              {{invert ? 'On' : 'Off'}}
            </div>
          </template>
        </v-switch>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import * as colors from '@/lib/colors'
import ColorBar from '@/components/ColorBar'

export default {
  name: 'ContinuousColorSettings',
  components: {
    ColorBar
  },
  data () {
    return {
      scheme: {
        options: [
          { header: 'Sequential (Multi Hue)' },
          ...colors.sequentialMulti,
          ...colors.sequentialMultiColor,
          { header: 'Sequential (Single Hue)' },
          ...colors.sequentialSingle,
          { header: 'Diverging' },
          ...colors.diverging,
          { header: 'Cyclical' },
          ...colors.cyclical
        ],
        selected: null
      },
      invert: false
    }
  },
  computed: {
    ...mapGetters(['colorContinuous'])
  },
  created () {
    this.scheme.selected = this.colorContinuous.scheme
    this.invert = this.colorContinuous.invert
  },
  methods: {
    ...mapActions(['setColorContinuous']),
    update () {
      this.setColorContinuous({ scheme: this.scheme.selected, invert: this.invert })
    }
  }
}
</script>
