<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Welcome to the Tagged Animal Movement Explorer</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="body-1 py-8 black--text">
      <p>
        The Tagged Animal Movement Explorer (TAME) is an interactive data visualization tool for exploring
        spatial and temporal patterns of animal movements.
      </p>

      <v-card-actions class="justify-space-around my-8">
        <v-btn color="success" class="px-4" x-large :to="{ name: 'newProject' }">Create New Project</v-btn>
        <div class="title">or</div>
        <v-btn color="success" class="px-4" x-large :to="{ name: 'projects' }">Load Existing Project</v-btn>
      </v-card-actions>

      <div class="title">Want to Learn More?</div>
      <p>Check out the <router-link :to="{ name: 'guide' }">User Guide</router-link> for a series of tutorials on what TAME is and how to use it.</p>

      <div class="title">What's New?</div>
      <div class="font-weight-bold text-overline secondary--text">Aug 25, 2022</div>
      <p>The file size limit for saving projects to the TAME server has been increased from 5 to 100 MB.</p>

      <v-divider class="my-8"></v-divider>

      <div class="title">About TAME</div>
      <p>
        TAME was built by <a href="https://walkerenvres.com" target="_blank">Jeffrey D Walker, PhD (Walker Environmental Research LLC under contract to USGS)</a> and
        <a href="https://www.usgs.gov/staff-profiles/benjamin-h-letcher" target="_blank">Benjamin Letcher, PhD (USGS)</a>
        with funding from the <a href="https://www.usgs.gov/centers/cdi" target="_blank">USGS Community for Data Integration (CDI)</a>.
      </p>
      <p>TAME is part of the <a href="https://www.usgs.gov/apps/ecosheds">EcoSHEDS</a> project. If you have any questions or problems, please contact us at <a href="mailto:gs-naar-lsc-ecosheds@doimspp.onmicrosoft.com">gs-naar-lsc-ecosheds@doimspp.onmicrosoft.com</a>.
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
