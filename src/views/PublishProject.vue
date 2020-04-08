<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Publish Project</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text v-if="!user" class="pt-4 pb-0">
      <v-alert type="error" outlined dense>
        <div class="font-weight-bold">Not Logged In</div>
        <p>You must be logged in to publish a project.</p>
        <p class="mb-0">Please <router-link :to="{ name: 'login'}">Log in</router-link> or <router-link :to="{ name: 'signup'}">Sign up</router-link> for a new account.</p>
      </v-alert>
    </v-card-text>
    <v-card-text v-else-if="!project" class="pt-4">
      <v-alert type="error" outlined dense>
        <div class="font-weight-bold">Project Not Found</div>
        <p>An existing project could not be found.</p>
        <p class="mb-0">Please <router-link :to="{ name: 'listProjects'}">Load a Project</router-link> or <router-link :to="{ name: 'newProject'}">Create A New Project</router-link>.</p>
      </v-alert>
    </v-card-text>
    <v-card-text v-else class="pt-4">
      <v-alert type="info" outlined dense class="mb-8">
        <div class="font-weight-bold">What is a Published Project?</div>
        <p>
          Publishing a project will save the dataset to the TAME web server and make it publicly accessible to <em>any user</em>
          from the <strong>Load Project</strong> screen.
        </p>
        <p>
          Once it is published, you can continue to make changes to the project by uploading new versions of the dataset or changing the variable settings.
        </p>
        <p class="mb-0">
          You will also be able to <strong>Unpublish</strong> the project at any time to remove it from the server.
        </p>
      </v-alert>

      <v-text-field
        label="Project Name"
        v-model="form.name"
        counter
        outlined
        class="my-4"
        hint="Provide a brief name for the project (e.g., location and species)"
        persistent-hint
        :error-messages="nameErrors">
      </v-text-field>

      <v-text-field
        label="Project ID"
        v-model="form.id"
        counter
        outlined
        :disabled="!isNew"
        :error-messages="idErrors"
        class="my-4"
        hint="Defines the URL for this project and cannot be changed. Must contain only lowercase letters, numbers, and dashes."
        persistent-hint>
      </v-text-field>

      <v-textarea
        label="Description"
        v-model="form.description"
        rows="3"
        counter
        outlined
        :error-messages="descriptionErrors"
        class="mt-4"
        hint="Describe your dataset (who, what, where, why, when and how)."
        persistent-hint>
      </v-textarea>

      <v-alert type="error" :value="!!serverError" outlined class="mt-4">
        {{serverError}}
      </v-alert>

      <v-alert type="success" v-if="status === 'SUCCESS'" outlined prominent class="mt-4">
        <div class="title">Success! Your project has been published.</div>
        <br>
        <div>
          You can find it on the <router-link :to="{ name: 'listProjects' }">Projects List</router-link>, or you can access it directly using the following URL: <br><br>
          <pre class="grey--text text--darken-2 ml-4">
            <router-link :to="{ name: 'loadProject', params: { id: form.id }}">{{ projectUrl }}</router-link>
          </pre>
        </div>
      </v-alert>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="mx-4 py-4">
      <v-btn
        v-if="!!user && !!project"
        @click="submit"
        color="primary"
        class="mr-4"
        :loading="status === 'PENDING'"
        :disabled="!user || !project || status === 'SUCCESS'">
        submit
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn text to="/">close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { helpers, required, minLength, maxLength } from 'vuelidate/lib/validators'
import { mapGetters, mapActions } from 'vuex'
import slugify from 'slugify'

const alphaNum = helpers.regex('alphaNum', /^[a-z0-9\\-]*$/)

export default {
  name: 'PublishProject',
  mixins: [validationMixin],
  validations: {
    form: {
      id: { required, alphaNum, minLength: minLength(4), maxLength: maxLength(50) },
      name: { required, minLength: minLength(4), maxLength: maxLength(100) },
      description: { required, minLength: minLength(4), maxLength: maxLength(250) }
    }
  },
  data () {
    return {
      form: {
        id: '',
        name: '',
        description: ''
      },
      isNew: true,
      status: 'READY',
      serverError: null
    }
  },
  computed: {
    ...mapGetters(['user', 'project', 'version']),
    idErrors () {
      const errors = []
      if (this.status === 'READY') return errors
      !this.$v.form.id.required && errors.push('ID is required.');
      (!this.$v.form.id.minLength || !this.$v.form.id.maxLength) && errors.push('ID must be between 4 and 50 characters.')
      !this.$v.form.id.alphaNum && errors.push('ID may only contain lowercase letters, numbers and dashes')
      return errors
    },
    nameErrors () {
      const errors = []
      if (this.status === 'READY') return errors
      !this.$v.form.name.required && errors.push('Name is required.');
      (!this.$v.form.name.minLength || !this.$v.form.name.maxLength) && errors.push('Name must be between 4 and 100 characters.')
      return errors
    },
    descriptionErrors () {
      const errors = []
      if (this.status === 'READY') return errors
      !this.$v.form.description.required && errors.push('Description is required.');
      (!this.$v.form.description.minLength || !this.$v.form.description.maxLength) && errors.push('Description must be between 4 and 250 characters.')
      return errors
    },
    projectUrl () {
      const base = process.env.VUE_APP_BASE_URL || 'http://localhost:8080/'
      const route = this.$router.resolve({
        name: 'loadProject',
        params: { id: this.form.id }
      })
      return `${base}${route.href}`
    }
  },
  watch: {
    'form.name' () {
      if (this.isNew) {
        this.form.id = slugify(this.form.name, { lower: true, remove: /[#$%^&{}*+~.,;()\\'"!:@\[\]]/g }) // eslint-disable-line
      }
    }
  },
  mounted () {
    if (this.project.id) {
      this.isNew = false
      this.form.id = this.project.id
      this.form.name = this.project.name
      this.form.description = this.project.description
    }
  },
  methods: {
    ...mapActions(['loadProject']),
    getToken () {
      return this.$Amplify.Auth.currentSession()
        .then(session => session.getIdToken().getJwtToken())
    },
    async submit () {
      this.serverError = null
      this.$v.form.$touch()
      if (this.$v.form.$invalid) {
        this.status = 'ERROR'
        return
      }

      this.$v.form.$reset()
      this.status = 'PENDING'

      // check if project ID is available
      if (this.isNew) {
        try {
          const response = await this.$http.get(`/projects/${this.form.id}`, {})
          if (response) {
          // if (response.status === 200) {
            return this.setError(`Project with ID '${this.form.id}' already exists, please try a different ID`)
          }
        } catch (e) {
          if (!e.response || !e.response.status === 404) {
            return this.setError(e)
          }
        }
      }

      // get token
      let token
      try {
        token = await this.getToken()
      } catch (e) {
        return this.setError(e)
      }

      let project
      try {
        const newProject = {
          id: this.form.id,
          name: this.form.name,
          description: this.form.description,
          columns: this.project.columns,
          variables: this.project.variables,
          version: this.version
        }

        if (this.isNew) {
          // console.log('post', newProject)
          project = await this.$http.post('/projects', newProject, {
            headers: {
              Authorization: token
            }
          }).then(response => response.data)
        } else {
          newProject.userId = this.project.userId
          newProject.createdAt = this.project.createdAt
          if (!this.project.file.local) {
            // no change to dataset
            newProject.file = this.project.file
          }
          project = await this.$http.put(`/projects/${newProject.id}`, newProject, {
            headers: {
              Authorization: token
            }
          }).then(response => response.data)
        }
      } catch (e) {
        return this.setError(e)
      }

      // upload dataset
      if (this.project.file.local) {
        try {
          const formData = new FormData()
          formData.append('dataset', this.project.file.local)
          project = await this.$http.post(`/projects/${project.id}/dataset`, formData, {
            headers: {
              'Content-Type': 'mulitpart/form-data',
              Authorization: token
            }
          }).then(response => response.data)
        } catch (e) {
          return this.setError(e)
        }
      }

      this.status = 'SUCCESS'

      this.loadProject(project)
    },
    setError (e) {
      this.status = 'ERROR'
      this.serverError = this.$Amplify.I18n.get(e.message || e)
    }
  }
}
</script>
