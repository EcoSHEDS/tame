<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Welcome to the Tagged Animal Movement Explorer</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="body-1 py-8">
      <v-alert type="error" dense text border="left" class="mt-0 mb-8 py-2">
        <div class="font-weight-bold body-1">TAME is Under Active Development</div>
        <div class="body-2">All user accounts and projects are temporary and may need to be recreated when the final version of TAME is released.</div>
      </v-alert>

      <p>
        The Tagged Animal Movement Explorer (TAME) is an interactive data visualization tool for exploring
        spatial and temporal patterns of animal movements.
      </p>

      <v-card-actions class="justify-space-around my-8">
        <v-btn color="success" class="px-4" x-large :to="{ name: 'newProject' }">Create New Project</v-btn>
        <div class="title">or</div>
        <v-btn color="success" class="px-4" x-large :to="{ name: 'projects' }">Load Existing Project</v-btn>
      </v-card-actions>

      <div class="title">First Time Here?</div>
      <p>Check out the <router-link :to="{ name: 'guide' }">User Guide</router-link> for an introduction to TAME.</p>

      <v-divider class="my-8"></v-divider>

      <div class="title">About TAME</div>
      <p>
        TAME was built by <a href="https://walkerenvres.com" target="_blank">Jeffrey D Walker, PhD (Walker Environmental Research)</a> and
        <a href="https://www.usgs.gov/staff-profiles/benjamin-h-letcher?qt-staff_profile_science_products=0#qt-staff_profile_science_products" target="_blank">Benjamin Letcher, PhD (USGS)</a>
        with funding from the <a href="https://www.usgs.gov/centers/cdi" target="_blank">USGS Community for Data Integration (CDI)</a>.
      </p>
      <p class="mb-0">
        If you have any questions or problems, please contact Jeff Walker at <a href="mailto:jeff@walkerenvres.com">jeff@walkerenvres.com</a>.
      </p>
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
  name: 'Welcome'
}
</script>
