<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">Available Projects</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>
    <v-card-text v-if="status === 'loading'">
      <v-progress-circular :size="32" :width="5" indeterminate color="primary"></v-progress-circular>
      <span class="headline ml-4" style="vertical-align:middle">Loading...</span>
    </v-card-text>
    <v-card-text v-else-if="status === 'error'">
      <v-alert type="error" outlined>
        Failed to load project list from server.
      </v-alert>
    </v-card-text>
    <v-card-text v-else-if="status === 'ready' && projects.length > 0">
      <v-card class="my-8" v-for="project in projects" :key="project.id">
        <v-card-title primary-title>
          {{ project.name }}
        </v-card-title>
        <v-card-text>
          <p>
            {{ project.description }}
          </p>
          <v-btn color="primary" :to="`/project/${ project.id }`">Launch Project</v-btn>
        </v-card-text>
      </v-card>
    </v-card-text>
    <v-card-text v-else>
      <v-alert type="info" outlined>
        No projects have been created yet!
      </v-alert>
    </v-card-text>
    <v-card-actions class="mx-4 pb-4">
      <v-spacer></v-spacer>
      <v-btn to="/">close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'Projects',
  data () {
    return {
      status: 'loading',
      projects: []
    }
  },
  mounted () {
    console.log('Projects:mounted')
    this.$http.get('projects/')
      .then(response => response.data)
      .then((projects) => {
        console.log(projects)
        this.projects = projects
        this.status = 'ready'
      })
      .catch((err) => {
        console.log(err)
        this.status = 'error'
      })
  }
}
</script>
