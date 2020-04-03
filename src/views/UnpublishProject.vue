<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">Unpublish Project</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="body-1">
      <v-alert type="error" outlined dense>
        <div class="font-weight-bold">Warning! This operation cannot be undone.</div>
        <p class="mt-4">
          When a project is unpublished, it will no longer be available to other users (including yourself)
          and the dataset will be deleted from the server.
        </p>
        <p class="mb-0">
          If you wish to continue, please click the <span class="font-weight-bold">Confirm</span> button below to unpublish your project.
        </p>
      </v-alert>

      <v-alert type="error" outlined :value="status === 'ERROR'">
        <span v-html="error"></span>
      </v-alert>
      <v-alert type="success" outlined :value="status === 'SUCCESS'">
        <strong>Project has been unpublished.</strong><br><br>
        You will be redirected to the <router-link :to="{ name: 'welcome' }">welcome</router-link> screen in 3 seconds...
      </v-alert>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="mx-4 py-4">
      <v-btn color="error" @click="confirm" :loading="status === 'PENDING'" :disabled="status === 'SUCCESS'">confirm</v-btn>
      <v-spacer></v-spacer>
      <v-btn to="/" text>close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'UnpublishProject',
  data () {
    return {
      status: 'READY',
      error: '',
      timeout: null
    }
  },
  computed: {
    ...mapGetters(['project', 'isOwner'])
  },
  mounted () {
    if (!this.project) {
      this.$router.push({ name: 'welcome' })
    }
  },
  beforeDestroy () {
    this.timeout && clearTimeout(this.timeout)
  },
  methods: {
    ...mapActions(['loadProject']),
    setError (message) {
      this.status = 'ERROR'
      this.error = message
    },
    getToken () {
      return this.$Amplify.Auth.currentSession()
        .then(session => session.getIdToken().getJwtToken())
    },
    async confirm () {
      if (!this.project) {
        return this.setError('Unable to find project')
      }
      if (!this.isOwner) {
        return this.setError('You are unauthorized to perform this operation.<br><br>Only the user who created the project may unpublish it.')
      }

      this.status = 'PENDING'
      this.error = null

      // get token
      let token
      try {
        token = await this.getToken()
      } catch (e) {
        return this.setError(e)
      }

      try {
        await this.$http.delete(`/projects/${this.project.id}`, {
          headers: {
            Authorization: token
          }
        })

        this.status = 'SUCCESS'
        this.timeout = setTimeout(() => {
          this.$router.push({ name: 'welcome' })
        }, 3000)
        this.loadProject()
      } catch (e) {
        return this.setError(e)
      }
    }
  }
}
</script>
