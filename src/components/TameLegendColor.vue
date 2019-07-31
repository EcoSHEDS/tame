<template>
  <div>
    <div class="my-2">
      <span class="font-weight-bold grey--text text--darken-2" v-if="variable">{{ variable.description }}</span><span v-else>None</span>
    </div>
    <component :is="`tame-legend-color-${variable.type}`" :variable="variable" v-if="variable"></component>
  </div>
</template>

<script>
import TameLegendColorContinuous from '@/components/TameLegendColorContinuous'
import TameLegendColorDiscrete from '@/components/TameLegendColorDiscrete'

export default {
  name: 'TameLegendColor',
  components: {
    TameLegendColorContinuous,
    TameLegendColorDiscrete
  },
  props: {
    variable: {
      type: Object
    }
  }
}
</script>
