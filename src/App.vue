<template>
  <v-app>
    <v-app-bar app clipped-left dark>
      <v-toolbar-title class="headline">
        <v-icon left>mdi-fish</v-icon>
        <span>Tagged Animal Movement Explorer (TAME)</span>
        <span class="text-uppercase overline ml-3">Beta Version</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/" class="mx-4">
        Home
      </v-btn>
      <v-btn text :to="{ name: 'about' }" class="mx-4">
        About
      </v-btn>
      <v-btn text :to="{ name: 'projects' }" class="mx-4">
        Projects
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
      <!-- <v-btn text href="https://ecosheds.org">
        <v-icon left>mdi-home</v-icon> SHEDS
      </v-btn> -->
    </v-app-bar>

    <v-content class="grey lighten-3">
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import { AmplifyEventBus } from 'aws-amplify-vue'

export default {
  name: 'App',
  computed: {
    ...mapGetters(['user'])
  },
  methods: {
    logout () {
      console.log('logout')
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
