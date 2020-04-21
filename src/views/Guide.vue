<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">User Guide</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="text-center body-1 py-8">
      <iframe width="1100" height="619" src="https://www.youtube.com/embed/xFTgoVptBfk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
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
  name: 'About'
}
</script>
