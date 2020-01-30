<template>
  <v-container>
    <v-layout row wrap style="max-width:500px" mx-auto class="mt-8">
      <v-row>
        <v-col>
          <router-view></router-view>
        </v-col>
      </v-row>
    </v-layout>
  </v-container>
</template>

<script>
import { AmplifyEventBus } from 'aws-amplify-vue'

export default {
  name: 'Auth',
  data () {
    return {
      user: {
        username: null,
        email: null
      }
    }
  },
  mounted () {
    AmplifyEventBus.$on('localUser', user => {
      this.user = user
    })
  }
}
</script>

<style>

</style>
