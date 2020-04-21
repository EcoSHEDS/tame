<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Load a Project</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>
    <v-card-text v-if="status === 'loading'" class="pt-8">
      <v-progress-circular :size="32" :width="5" indeterminate color="primary"></v-progress-circular>
      <span class="headline ml-4" style="vertical-align:middle">Loading Projects...</span>
    </v-card-text>
    <v-card-text v-else-if="status === 'error'" class="pt-8">
      <v-alert type="error" outlined prominent>
        <div class="title">Failed to load projects from server.</div>
      </v-alert>
    </v-card-text>
    <v-card-text v-else-if="status === 'ready'" class="py-4 px-6">
      <div v-if="user">
        <div class="title">My Projects</div>
        <div class="caption">Only you can see this list. However, your published projects will also appear in the list below, which is available to all users.</div>
        <v-row v-if="userProjects.length > 0">
          <v-col cols="12" md="6" lg="4" xl="4" v-for="project in userProjects" :key="project.id">
            <v-card class="fill-height d-flex flex-column">
              <v-card-title primary-title class="pb-0">
                <span class="text-truncate title">{{ project.name }}</span>
              </v-card-title>
              <v-card-text class="caption pb-0">
                Updated: {{ project.updatedAt | moment('from') }} |
                <span v-if="project.publish">
                  Published
                </span>
                <span class="red--text" v-else>
                  Not Published
                </span>
              </v-card-text>
              <v-card-text class="flex pt-4 pb-0">
                <p class="body-2 grey--text text--darken-3">{{ project.description }}</p>
              </v-card-text>
              <v-card-actions class="pa-4">
                <v-btn color="primary" class="px-2" :to="`/projects/${ project.id }`">Load Project <v-icon >mdi-chevron-right</v-icon></v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <v-alert type="error" outlined prominent color="primary" v-else class="mt-4">
          <div class="title">You do not have any projects!</div>
          <router-link :to="{ name: 'newProject' }">Create a new one?</router-link>
        </v-alert>
        <v-divider class="my-8"></v-divider>
      </div>
      <div>
        <div class="title">Published Projects</div>
        <v-row v-if="publishedProjects.length > 0">
          <v-col cols="12" md="6" lg="4" xl="4" v-for="project in publishedProjects" :key="project.id">
            <v-card class="fill-height d-flex flex-column">
              <v-card-title primary-title class="pb-0">
                <span class="text-truncate title">{{ project.name }}</span>
              </v-card-title>
              <v-card-text class="caption pb-0">
                Updated: {{ project.updatedAt | moment('from') }}
              </v-card-text>
              <v-card-text class="flex pt-4 pb-0">
                <p class="body-2 grey--text text--darken-3">{{ project.description }}</p>
              </v-card-text>
              <v-card-actions class="pa-4">
                <v-btn color="primary" class="px-2" :to="`/projects/${ project.id }`">Load Project <v-icon >mdi-chevron-right</v-icon></v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <v-alert type="error" outlined prominent color="primary" v-else class="mt-4">
          <div class="title">No projects have been published yet!</div>
          <router-link :to="{ name: 'newProject' }">Create a new one?</router-link>
        </v-alert>
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
import * as d3 from 'd3'
import { mapGetters } from 'vuex'

export default {
  name: 'Projects',
  data () {
    return {
      status: 'loading',
      userProjects: [],
      publishedProjects: []
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  mounted () {
    // console.log('Projects:mounted')
    Promise.all([this.fetchPublishedProjects(), this.fetchUserProjects()])
      .then(([publishedProjects, userProjects]) => {
        this.publishedProjects = publishedProjects
        this.userProjects = userProjects
        this.status = 'ready'
      })
      .catch((err) => {
        console.log(err)
        this.status = 'error'
      })
  },
  methods: {
    fetchPublishedProjects () {
      return this.$http.get('/projects')
        .then(response => response.data
          .filter(d => d.publish)
          .sort((a, b) => d3.ascending(a.name.toLowerCase(), b.name.toLowerCase()))
        )
    },
    fetchUserProjects () {
      if (!this.user) return Promise.resolve([])

      return this.$Amplify.Auth.currentSession()
        .then(session => session.getIdToken().getJwtToken())
        .then(token => {
          return this.$http.get('/user-projects', {
            headers: { Authorization: token }
          })
        })
        .then(response => response.data
          .sort((a, b) => d3.ascending(a.name.toLowerCase(), b.name.toLowerCase()))
        )
    }
  }
}
</script>
