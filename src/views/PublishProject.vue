<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">Publish Project</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text v-if="!user">
      <p>You must have an account to publish a project.</p>
      <p>Please <router-link :to="{ name: 'login'}">Log in</router-link> or <router-link :to="{ name: 'signup'}">Sign up</router-link>.</p>
    </v-card-text>
    <v-card-text v-else-if="!project">
      <p>No project could be found.</p>
    </v-card-text>
    <v-card-text v-else>
      <p class="body-1">
        Publishing a project will save the dataset to the TAME web server and make it publicly accessible to any user.
      </p>
      <p class="body-1">
        Once it is published, you can continue to make changes to the project settings or upload new versions of the dataset.
      </p>
      <p class="body-1">
        You can also un-publish the project at any time to remove it from the server and make it no longer accessible to other users.
      </p>

      <v-divider></v-divider>

      <p class="subtitle mt-4">
        Please fill out the following form, and click Submit to publish this project.
      </p>

      <v-text-field
        label="Project Name"
        v-model="form.name"
        counter
        :error-messages="nameErrors">
      </v-text-field>

      <v-text-field
        label="Project ID"
        v-model="form.id"
        counter
        :disabled="!isNew"
        :error-messages="idErrors"
        hint="Must contain only lowercase letters, numbers, and dashes. Will be used to assign a direct URL to this project and cannot be changed."
        persistent-hint>
      </v-text-field>

      <v-textarea
        label="Description"
        v-model="form.description"
        rows="3"
        counter
        :error-messages="descriptionErrors"
        hint="Briefly describe what this dataset represents (i.e. the who, what, where, why, when and how)."
        persistent-hint>
      </v-textarea>

      <v-alert type="error" :value="!!serverError" outlined class="mt-4">
        {{serverError}}
      </v-alert>

      <v-alert type="success" v-if="status === 'SUCCESS'" outlined class="mt-4">
        <strong>Success! Your project has been published.</strong><br><br>
        You can find it on the <router-link :to="{ name: 'listProjects' }">Projects List</router-link>, or you can access it directly using the following URL: <br><br>
        <pre class="grey--text text--darken-2">
          <router-link :to="{ name: 'loadProject', params: { id: form.id }}">{{ projectUrl }}</router-link>
        </pre>
      </v-alert>
    </v-card-text>

    <v-card-actions class="mx-4 pb-4">
      <v-btn @click="submit" color="primary" class="mr-4" :loading="status === 'PENDING'" :disabled="!user || !project || status === 'SUCCESS'">submit</v-btn>
      <v-spacer></v-spacer>
      <v-btn to="/">close</v-btn>
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
    ...mapGetters(['user', 'project']),
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
          variables: this.project.variables
        }

        if (this.isNew) {
          console.log('post', newProject)
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
