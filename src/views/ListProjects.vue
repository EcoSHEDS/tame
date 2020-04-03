<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Load a Project</span>
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
    <v-card-text v-else-if="status === 'ready' && projects.length > 0" class="py-4 px-6">
      <v-row>
        <v-col cols="12" lg="6" xl="4" v-for="project in projects" :key="project.id">
          <v-card class="fill-height d-flex flex-column">
            <v-card-title primary-title class="pb-0">
              <span class="text-truncate">{{ project.name }}</span>
            </v-card-title>
            <v-card-text class="body-2 pb-4">
              Last Update: {{ project.updatedAt | moment('MMM DD, YYYY') }}
            </v-card-text>
            <v-card-text class="flex pb-0">
              <p class="body-1 grey--text text--darken-3">{{ project.description }}</p>
            </v-card-text>
            <v-card-actions class="pa-4">
              <v-btn large color="primary" class="px-6" :to="`/project/${ project.id }`">Load Project <v-icon right>mdi-chevron-right</v-icon></v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
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
    // console.log('Projects:mounted')
    this.$http.get('/projects')
      .then(response => {
        this.projects = response.data
          .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : a.name >= b.name ? 0 : NaN))
          // .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : a.updatedAt >= b.updatedAt ? 0 : NaN))
        this.status = 'ready'
      })
      .catch((err) => {
        console.log(err)
        this.status = 'error'
      })
  }
}
</script>
