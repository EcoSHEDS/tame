<template>
  <v-container>
    <v-layout row wrap style="max-width:960px" mx-auto>
      <v-row>
        <v-col>
          <h1 class="display-2 pb-8">Project List</h1>
          <div v-if="status === 'loading'">
            <v-card>
              <v-card-text>
                <v-progress-circular :size="32" :width="5" indeterminate color="primary"></v-progress-circular>
                <span class="headline ml-4" style="vertical-align:middle">Loading...</span>
              </v-card-text>
            </v-card>
          </div>
          <div v-if="status === 'error'">
            <v-card>
              <v-alert type="error" :value="true">
                Failed to load project list from server.
              </v-alert>
            </v-card>
          </div>
          <div v-if="status === 'ready'">
            <v-card class="my-8" color="grey lighten-2" v-for="project in projects" :key="project.id">
              <v-card-title primary-title>
                {{ project.label }}
              </v-card-title>
              <v-card-text>
                <v-btn color="primary" :to="`/project/${ project.id }`">Load Project</v-btn>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-layout>
  </v-container>
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
    this.$http.get('projects.json')
      .then(response => response.data)
      .then((projects) => {
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
