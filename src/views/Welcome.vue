<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">Welcome to the Tagged Animal Movement Explorer</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Id labore asperiores quia deserunt dolor blanditiis beatae animi nisi dolorem odio officiis aliquam non repellendus, adipisci fugit quaerat, doloribus porro mollitia.
      </p>
      <p>
        <router-link :to="{ name: 'newProject' }">Create a new project</router-link>
        or
        <router-link :to="{ name: 'listProjects' }">load an existing one</router-link>
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
  name: 'Welcome'
}
</script>
