<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">Delete Project</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="body-1 pb-4">
      <v-alert type="error" dense text border="left" class="body-2" :value="status !== 'SUCCESS'">
        <div class="body-1 font-weight-bold">Warning! This operation cannot be undone.</div>
        <div class="mb-2">
          When a project is deleted, it cannot be recovered.
        </div>
        <div class="mt-2">
          If you wish to continue, please click the <span class="font-weight-bold">Confirm</span> button below to delete your project.
        </div>
      </v-alert>

      <v-alert type="error" dense text border="left" :value="status === 'ERROR'" class="body-2">
        <div class="body-1 font-weight-bold">Server Error</div>
        <div><span v-html="error"></span></div>
      </v-alert>
      <v-alert type="success" dense text border="left" :value="status === 'SUCCESS'" class="body-2">
        <div class="body-1 font-weight-bold">Project Has Been Deleted</div>
        <div>You will be redirected to the <router-link :to="{ name: 'welcome' }">welcome</router-link> screen in 3 seconds...</div>
      </v-alert>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="mx-4 py-4">
      <v-btn color="error" @click="confirm" :loading="status === 'PENDING'" :disabled="status === 'SUCCESS'"><v-icon left>mdi-delete</v-icon> confirm</v-btn>
      <v-spacer></v-spacer>
      <v-btn to="/" text>close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'DeleteProject',
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
    ...mapActions(['setProject']),
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
        return this.setError('You are unauthorized to perform this operation.<br><br>Only the user who created the project may delete it.')
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
        this.setProject()
      } catch (e) {
        return this.setError(e)
      }
    }
  }
}
</script>
