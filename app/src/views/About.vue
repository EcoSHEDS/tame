<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">About</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text>
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Alias quod mollitia, amet dolores quasi ipsum non quae sapiente harum voluptas consectetur maiores numquam, accusantium, molestiae natus vero assumenda fugiat. In?
    </v-card-text>

    <v-card-actions class="mx-4 pb-4">
      <v-spacer></v-spacer>
      <v-btn to="/">close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'About'
}
</script>
