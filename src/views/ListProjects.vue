<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Published Projects</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>
    <v-card-text v-if="status === 'loading'" class="pt-8">
      <v-progress-circular :size="32" :width="5" indeterminate color="primary"></v-progress-circular>
      <span class="headline ml-4" style="vertical-align:middle">Loading...</span>
    </v-card-text>
    <v-card-text v-else-if="status === 'error'" class="pt-8">
      <v-alert type="error" outlined prominent>
        <div class="title">Failed to load project list from server.</div>
      </v-alert>
    </v-card-text>
    <v-card-text v-else-if="status === 'ready' && projects.length > 0">
      <v-card class="mt-8 mb-4" v-for="project in projects" :key="project.id">
        <v-card-title primary-title>
          {{ project.name }}
        </v-card-title>
        <v-card-text>
          <p class="body-2">{{ project.description }}</p>
          <v-btn color="primary" :to="`/project/${ project.id }`">Launch Project</v-btn>
        </v-card-text>
      </v-card>
    </v-card-text>
    <v-card-text v-else class="py-8">
      <v-alert type="error" outlined prominent color="primary">
        <div class="title">No projects have been created yet!</div>
        <router-link :to="{ name: 'newProject' }">Create a new one?</router-link>
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
  name: 'ListProjects',
  data () {
    return {
      status: 'loading',
      projects: []
    }
  },
  mounted () {
    console.log('Projects:mounted')
    this.$http.get('/projects')
      .then(response => {
        this.projects = response.data
        this.status = 'ready'
      })
      .catch((err) => {
        console.log(err)
        this.status = 'error'
      })
  }
}
</script>
