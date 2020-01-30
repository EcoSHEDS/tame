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
      <v-btn text to="/about" class="mx-4">
        About
      </v-btn>
      <v-btn text to="/projects" class="mx-4">
        Projects
      </v-btn>
      <v-btn text to="/login" class="mx-4">
        Login
      </v-btn>
      <v-btn text to="/signup" class="mx-4" dark outlined>
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
export default {
  name: 'App'
}
</script>
