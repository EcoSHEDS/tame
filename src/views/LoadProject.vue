<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">Loading Project</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text v-if="status === 'LOADING'" class="text-center">
      <v-progress-circular :size="64" :width="5" indeterminate color="primary"></v-progress-circular>
      <span class="display-2 ml-8" style="vertical-align:middle">Loading...</span>
    </v-card-text>
    <v-card-text v-else-if="status === 'ERROR'">
      <v-alert type="error" outlined>
        Failed to load project.<br><br>
        {{ error }}
      </v-alert>
    </v-card-text>
    <v-card-text v-else-if="status === 'SUCCESS'">
      <v-alert type="success" outlined>
        Project has been loaded
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
import { mapActions } from 'vuex'
export default {
  name: 'LoadProject',
  data () {
    return {
      status: 'LOADING',
      error: null
    }
  },
  mounted () {
    this.$http.get(`/projects/${this.$route.params.id}`)
      .then(response => response.data)
      .then(project => this.loadProject(project))
      .then(project => {
        this.status = 'SUCCESS'
        this.$router.push('/')
      })
      .catch(e => {
        console.log(e)
        this.setError(e)
      })
  },
  methods: {
    ...mapActions(['loadProject']),
    setError (e) {
      this.status = 'ERROR'
      this.error = this.$Amplify.I18n.get(e.message || e)
    }
  }
}
</script>
