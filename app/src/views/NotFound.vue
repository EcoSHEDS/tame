<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Not Found</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="py-8">
      <v-alert type="error" outlined prominent color="grey darken-1">
        <div class="title">Page Not Found</div>
        <router-link :to="{ name: 'welcome' }">Return to the Welcome screen?</router-link>
      </v-alert>
    </v-card-text>

    <v-divider></v-divider>
    <v-card-actions class="mx-4">
      <v-spacer></v-spacer>
      <v-btn to="/" text>close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'Error'
}
</script>
