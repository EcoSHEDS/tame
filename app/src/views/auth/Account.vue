<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">My Account</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="pt-4 body-1">
      <v-form @submit.prevent="submit" :disabled="submitStatus === 'PENDING'">
        <div class="title mb-4">My Information</div>
        <v-text-field
          v-model="email"
          label="Email Address"
          required
          hint="Email cannot be changed, please contact us if you need to change it."
          persistent-hint
          disabled
        ></v-text-field>
        <v-text-field
          v-model="name"
          :error-messages="nameErrors"
          label="Name"
          required
          @input="$v.name.$touch()"
          @blur="$v.name.$touch()"
        ></v-text-field>
        <v-text-field
          v-model="affiliation"
          :error-messages="affiliationErrors"
          label="Affiliation (optional)"
          @input="$v.affiliation.$touch()"
          @blur="$v.affiliation.$touch()"
        ></v-text-field>

        <v-alert type="error" :value="!!serverError" dense text border="left" class="body-2">
          <div class="body-1 font-weight-bold">Server Error</div>
          <div>{{serverError}}</div>
        </v-alert>

        <v-alert type="success" :value="submitStatus === 'SUCCESS'" dense text border="left" dismissible class="body-2">
          <div class="body-1 font-weight-bold">Update complete</div>
          <div>Changes have been saved to the server</div>
        </v-alert>

        <v-card-actions class="px-0">
          <v-btn
            type="submit"
            color="primary"
            class="mr-4"
            :disabled="!$v.$anyDirty"
            :loading="submitStatus === 'PENDING'">
            save changes
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" :to="{ name: 'changePassword' }">Change Password</v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>

    <v-divider class="mb-4"></v-divider>

    <v-card-text>
      <div class="title mb-4">My Projects</div>
      <div v-if="projectsStatus === 'PENDING'" class="subtitle-1">
        <v-progress-circular :size="24" :width="4" indeterminate color="primary"></v-progress-circular>
        <span class="ml-4" style="vertical-align:middle">Loading projects...</span>
      </div>
      <div v-else-if="projectsStatus === 'ERROR'">
        <v-alert type="error" dense text border="left" class="mb-0 body-2">
          <div class="body-1 font-weight-bold">Server Error</div>
          <div>Failed to load projects.</div>
        </v-alert>
      </div>
      <div v-else>
        <v-alert type="info" dense text border="left" :value="projects.length === 0" class="mb-0 body-2">
          <div class="body-1 font-weight-bold">No Projects Found</div>
          <div class="mb-2">You do not have any current projects.</div>
          <div class="mt-2">Ready to <router-link :to="{ name: 'newProject' }">create a new project</router-link>?</div>
        </v-alert>
        <v-alert color="primary" dense text border="left" v-for="project in projects" :key="project.id" class="py-0">
          <v-row class="mx-0">
            <v-col cols="8" class="grey--text text--darken-3">
              <div class="subtitle-1 font-weight-medium">{{project.name}}</div>
              <div class="caption mb-2 mt-n1">
                Updated: {{ project.updatedAt | moment('from') }} |
                <span v-if="project.publish">
                  Published
                </span>
                <span class="red--text" v-else>
                  Not Published
                </span>
              </div>
              <div class="body-2">{{project.description | truncate(50)}}</div>
            </v-col>
            <v-col cols="4" class="text-right align-self-center">
              <v-btn outlined color="primary" :to="`/projects/${ project.id }`">Load <v-icon small>mdi-chevron-right</v-icon></v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="mx-4 py-4">
      <v-spacer></v-spacer>
      <v-btn text @click="$router.push({ name: 'home' })">close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, maxLength } from 'vuelidate/lib/validators'
import { AmplifyEventBus } from 'aws-amplify-vue'
import * as d3 from 'd3'

export default {
  name: 'Account',
  mixins: [validationMixin],
  validations: {
    name: { required },
    affiliation: { maxLength: maxLength(100) }
  },
  data () {
    return {
      submitStatus: 'READY',
      serverError: '',
      name: '',
      email: '',
      affiliation: '',
      projectsStatus: 'PENDING',
      projects: []
    }
  },
  computed: {
    ...mapGetters(['user']),
    nameErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.name.required && errors.push('Name is required.')
      return errors
    },
    affiliationErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.affiliation.maxLength && errors.push('Cannot be more than 100 characters')
      return errors
    }
  },
  mounted () {
    if (!this.user) {
      return this.$router.push({ name: 'login' })
    }
    this.name = this.user.attributes.name
    this.email = this.user.attributes.email
    this.affiliation = this.user.attributes['custom:affiliation']

    this.fetchUserProjects()
  },
  methods: {
    fetchUserProjects () {
      if (!this.user) return

      return this.$Amplify.Auth.currentSession()
        .then(session => session.getIdToken().getJwtToken())
        .then(token => {
          return this.$http.get('/user-projects', {
            headers: { Authorization: token }
          })
        })
        .then(response => {
          this.projects = response.data
            .sort((a, b) => d3.ascending(a.name.toLowerCase(), b.name.toLowerCase()))
          this.projectsStatus = 'SUCCESS'
        })
        .catch((err) => {
          console.error(err)
          this.projectsStatus = 'ERROR'
        })
    },
    submit () {
      this.$v.$touch()
      this.serverError = null
      if (this.$v.$invalid) {
        this.submitStatus = 'ERROR'
      } else {
        this.submitStatus = 'PENDING'
        return this.$Amplify.Auth.currentAuthenticatedUser()
          .then((user) => this.$Amplify.Auth.updateUserAttributes(user, {
            email: this.email,
            name: this.name,
            'custom:affiliation': this.affiliation
          }))
          .then(data => this.$Amplify.Auth.currentAuthenticatedUser({ bypassCache: true }))
          .then((user) => {
            this.submitStatus = 'SUCCESS'
            this.$v.$reset()
            AmplifyEventBus.$emit('authState', { state: 'signInRefresh' })
          })
          .catch(e => this.setError(e))
      }
    },
    setError (e) {
      this.submitStatus = 'ERROR'
      this.serverError = this.$Amplify.I18n.get(e.message || e)
    },
    clear () {
      this.$v.$reset()
      this.name = ''
      this.email = ''
      this.affiliation = ''
      this.submitStatus = 'READY'
      this.serverError = null
    }
  }
}
</script>
