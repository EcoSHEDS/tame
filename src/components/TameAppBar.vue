<template>
  <v-app-bar app dense clipped-left dark absolute :style="{ 'margin-top': usgs ? '72px' : '0'}">
    <v-toolbar-title class="headline">
      <span>Tagged Animal Movement Explorer (TAME)</span>
      <span class="text-uppercase overline ml-3">Beta</span>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn text :to="{ name: 'welcome' }" class="mx-4">
      Welcome
    </v-btn>
    <v-btn text class="mx-4" v-if="user" :to="{ name: 'account' }">
      My Account
    </v-btn>
    <v-btn text class="mx-4" v-if="user" @click="logout">
      Log Out
    </v-btn>
    <v-btn text :to="{ name: 'login' }" class="mx-4" v-if="!user">
      Log In
    </v-btn>
    <v-btn text :to="{ name: 'signup' }" class="mx-4" dark outlined v-if="!user">
      Sign Up
    </v-btn>
  </v-app-bar>
</template>

<script>
import { mapGetters } from 'vuex'
import { AmplifyEventBus } from 'aws-amplify-vue'

export default {
  name: 'TameAppBar',
  props: ['marginTop'],
  computed: {
    ...mapGetters(['user', 'usgs'])
  },
  methods: {
    logout () {
      this.$Amplify.Auth.signOut()
        .then(() => {
          return AmplifyEventBus.$emit('authState', { state: 'signedOut' })
        })
        .catch((e) => {
          console.log(e)
          alert('Error occurred trying to log out')
        })
    }
  }
}
</script>
