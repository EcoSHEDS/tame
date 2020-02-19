<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">Not Found</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text>
      <p class="title">
        The page you are looking for could not be found! <router-link :to="{ name: 'welcome' }">Click here to return home.</router-link>
      </p>
    </v-card-text>

    <v-card-actions class="mx-4 pb-4">
      <v-spacer></v-spacer>
      <v-btn to="/">close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'Error'
}
</script>
