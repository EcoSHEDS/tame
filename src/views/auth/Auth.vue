<template>
  <router-view></router-view>
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
