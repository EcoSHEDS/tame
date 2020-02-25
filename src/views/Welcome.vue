<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">Welcome to the Tagged Animal Movement Explorer</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="py-8">
      <v-card-actions class="justify-space-around">
        <v-btn color="success" class="px-4" x-large :to="{ name: 'newProject' }">Create New Project</v-btn>
        <v-btn color="success" class="px-4" x-large :to="{ name: 'listProjects' }">Load Existing Project</v-btn>
      </v-card-actions>
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
