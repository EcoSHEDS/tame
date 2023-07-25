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

      <div><strong>Want to learn more?</strong> See the <router-link :to="{ name: 'guide' }">User Guide</router-link>.</div>

      <div class="mt-4"><strong>Need an account?</strong> <router-link :to="{ name: 'signup' }">Sign up</router-link></div>
      <div><strong>Already have an account?</strong> <router-link :to="{ name: 'login' }">Login</router-link></div>
      <div class="body-2">
        Note: Account is <u>not required</u> to visualization your data, it is only required to save and publish datasets to the server.
      </div>

      <v-divider class="my-4"></v-divider>

      <div class="text-h5">What's New?</div>
      <div class="font-weight-bold text-caption secondary--text">Jul 25, 2023</div>
      <p>Re-designed <router-link :to="{ name: 'projects' }">Projects page</router-link> lets you search and sort projects by name and date.</p>

      <div class="font-weight-bold text-caption secondary--text">Aug 25, 2022</div>
      <div>The file size limit for saving projects to the TAME server has been increased from 5 to 100 MB.</div>

      <v-divider class="my-4"></v-divider>

      <div class="text-h5">About TAME</div>
      <div>
        TAME was built by Jeffrey D Walker, PhD (<a href="https://walkerenvres.com" target="_blank">Walker Environmental Research LLC</a>) and
        Benjamin Letcher, PhD (<a href="https://www.usgs.gov/staff-profiles/benjamin-h-letcher" target="_blank">USGS</a>)
        with funding from the <a href="https://www.usgs.gov/centers/cdi" target="_blank">USGS Community for Data Integration (CDI)</a>.
      </div>
      <div class="mt-4">TAME is part of the <a href="https://www.usgs.gov/apps/ecosheds">EcoSHEDS</a> project. If you have any questions or problems, please contact us at <a href="mailto:ecosheds@usgs.gov">ecosheds@usgs.gov</a>.
      </div>
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
