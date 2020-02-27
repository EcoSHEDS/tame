<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">Welcome to the Tagged Animal Movement Explorer</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text>
      <p>
        The Tagged Animal Movement Explorer (TAME) is an interactive data visualization tool for exploring
        spatial and temporal patterns of animal movements.
      </p>
      <v-card-actions class="justify-space-around my-8">
        <v-btn color="success" class="px-4" x-large :to="{ name: 'newProject' }">Create New Project</v-btn>
        <div class="title">or</div>
        <v-btn color="success" class="px-4" x-large :to="{ name: 'listProjects' }">Load Existing Project</v-btn>
      </v-card-actions>

      <p>
        Built by <a href="https://walkerenvres.com" target="_blank">Walker Environmental Research</a> and
        <a href="https://www.usgs.gov/staff-profiles/benjamin-h-letcher?qt-staff_profile_science_products=0#qt-staff_profile_science_products" target="_blank">Ben Letcher</a> with
        funding from the <a href="https://www.usgs.gov/centers/cdi" target="_blank">USGS Community for Data Integration</a>.
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
