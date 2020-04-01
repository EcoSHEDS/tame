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
        <ColorBar :id="`settings-discrete-selected`" type="discrete" :scheme="data.item" :width="200" :height="18"></ColorBar>
        <span class="ml-4">{{ data.item }}</span>
      </template>
      <template v-slot:item="data">
        <ColorBar :id="`settings-discrete-${data.item}`" type="discrete" :scheme="data.item" :width="200" :height="18"></ColorBar>
        <span class="ml-4">{{ data.item }}</span>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import * as colors from '@/lib/colors'
import ColorBar from '@/components/ColorBar'

export default {
  name: 'DiscreteColorSettings',
  components: {
    ColorBar
  },
  data () {
    return {
      scheme: {
        options: [
          { header: 'Categorical' },
          ...colors.categorical
          // { header: 'Sequential (Multi Hue)' },
          // ...colors.sequentialMultiColor,
          // { header: 'Sequential (Single Hue)' },
          // ...colors.sequentialSingle,
          // { header: 'Diverging' },
          // ...colors.diverging
        ],
        selected: null
      }
    }
  },
  computed: {
    ...mapGetters(['colorDiscrete'])
  },
  created () {
    this.scheme.selected = this.colorDiscrete.scheme
  },
  methods: {
    ...mapActions(['setColorDiscrete']),
    update () {
      this.setColorDiscrete({ scheme: this.scheme.selected })
    }
  }
}
</script>
