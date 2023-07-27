<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Save Project</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text v-if="!user" class="pt-4 pb-0 black--text">
      <v-alert type="error" dense text border="left" class="body-2">
        <div class="body-1 font-weight-bold">Not Logged In</div>
        <div class="my-2">
          You must be logged in to save a project.
        </div>
        <div class="mt-2">
          Please <router-link :to="{ name: 'login'}">Log in</router-link> or <router-link :to="{ name: 'signup'}">Sign up</router-link> for a new account.
        </div>
      </v-alert>
    </v-card-text>
    <v-card-text v-else-if="!project" class="pt-4 pb-0 black--text">
      <v-alert type="error" dense text border="left" class="body-2">
        <div class="body-1 font-weight-bold">Project Not Found</div>
        <div class="mb-2">An existing project could not be found.</div>
        <div class="mt-2">Please <router-link :to="{ name: 'projects'}">Load a Project</router-link> or <router-link :to="{ name: 'newProject'}">Create A New Project</router-link>.</div>
      </v-alert>
    </v-card-text>
    <v-card-text v-else-if="project.file.size > maxFileSize" class="pt-4 pb-0 black--text">
      <v-alert type="error" dense text border="left" class="body-2">
        <div class="body-1 font-weight-bold">File Size Too Large</div>
        <div class="mb-2">
          The dataset file for this project exceeds the maximum size of 100 MB (file is {{ (project.file.size / 1e6).toFixed(1) }} MB).
        </div>
        <div class="my-2">
          To save this dataset, reduce the file size by removing rows and/or columns and then reload the CSV file using the <strong>Edit Project</strong> form.
        </div>
      </v-alert>
    </v-card-text>
    <v-card-text v-else class="pt-4 black--text">
      <div v-if="status !== 'SUCCESS'">
        <v-alert type="info" dense text border="left" class="mb-4 body-2">
          <div class="body-1 font-weight-bold">Instructions</div>
          <div class="mb-2">
            Saving a project will save the dataset and project settings to the TAME web server so that you can return to this dataset later or share it with other users.
          </div>
          <div class="my-2">
            Each saved project will be assigned a unique URL, which will be publicly accessible to anyone who has the link.
          </div>
          <div class="my-2">
            If you select the <span class="font-weight-bold">Publish</span> option below, then this project will also be listed on the <span class="font-weight-bold">Load Project</span> screen.
          </div>
        </v-alert>

        <v-alert type="warning" dense text border="left" class="mb-8 body-2">
          <div class="body-1 font-weight-bold">All Saved Projects Are Publicly Accessible</div>
          <div class="mb-2">
            TAME does not restrict access to any saved project. Any project can be loaded directly by any user using the project URL.
            If you opt out of publishing your project, then only users with the URL can find the project. However, that will not prevent
            other users who acquire the URL from accessing it.
          </div>
          <div>
            DO NOT save any project containing highly sensitive data.
          </div>
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

        <v-checkbox
          label="Publish Project"
          v-model="form.publish"
          hint="If checked, this project will be shown on the Load Project screen."
          persistent-hint>
        </v-checkbox>

        <v-textarea
          label="Description"
          v-model="form.description"
          rows="3"
          counter
          outlined
          :error-messages="descriptionErrors"
          class="mt-4"
          hint="Describe your dataset (target species, location, purpose)."
          persistent-hint>
        </v-textarea>

        <v-textarea
          label="Data Citation (optional)"
          v-model="form.citation"
          rows="2"
          counter
          outlined
          :error-messages="citationErrors"
          class="mt-4"
          hint="Provide a citation, URL, or contact information for the data source, if available."
          persistent-hint>
        </v-textarea>

        <v-alert type="error" :value="!!serverError" dense text border="left" class="mt-4 body-2">
          <div class="body-1 font-weight-bold">Server Error</div>
          <div>{{serverError}}</div>
        </v-alert>
      </div>

      <v-alert type="success" v-if="status === 'SUCCESS'" dense text border="left" class="mt-4 body-2">
        <div class="body-1 font-weight-bold">Success! Your project has been saved.</div>
        <div>
          You can find it on the <router-link :to="{ name: 'projects' }">Projects List</router-link>, or you can access it directly using the following URL: <br><br>
          <pre class="grey--text text--darken-2">
            <router-link :to="{ name: 'loadProject', params: { id: form.id }}">{{ projectUrl }}</router-link>
          </pre>
        </div>
      </v-alert>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="mx-4 py-4">
      <v-btn
        v-if="!!user && !!project && project.file.size <= maxFileSize"
        @click="submit"
        color="primary"
        class="mr-4"
        :loading="status === 'PENDING'"
        :disabled="!user || !project || project.file.size > maxFileSize || status === 'SUCCESS'">
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
  name: 'SaveProject',
  mixins: [validationMixin],
  validations: {
    form: {
      id: { required, alphaNum, minLength: minLength(4), maxLength: maxLength(50) },
      name: { required, minLength: minLength(4), maxLength: maxLength(100) },
      description: { required, minLength: minLength(4), maxLength: maxLength(1000) },
      citation: { maxLength: maxLength(500) }
    }
  },
  data () {
    return {
      maxFileSize: 100 * 1024 * 1024,
      form: {
        id: null,
        name: null,
        description: null,
        citation: null,
        publish: false
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
      (!this.$v.form.description.minLength || !this.$v.form.description.maxLength) && errors.push('Description must be between 4 and 1,000 characters.')
      return errors
    },
    citationErrors () {
      const errors = []
      if (this.status === 'READY') return errors
      !this.$v.form.citation.maxLength && errors.push('Citation cannot exceed 500 characters.')
      return errors
    },
    projectUrl () {
      // const base = process.env.VUE_APP_BASE_URL || 'http://localhost:8080/'
      const base = 'https://www.usgs.gov/apps/ecosheds/tame/'
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
      this.form.citation = this.project.citation
      this.form.publish = this.project.publish
    }
  },
  methods: {
    ...mapActions(['setProject']),
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
        let newProject = {
          id: this.form.id,
          name: this.form.name,
          description: this.form.description,
          citation: this.form.citation,
          file: this.project.file,
          columns: this.project.columns,
          variables: this.project.variables,
          aggregation: this.project.aggregation,
          publish: this.form.publish,
          version: this.version
        }
        newProject = JSON.parse(JSON.stringify(newProject))
        newProject.variables.forEach(d => {
          delete d.domain
        })
        if (newProject.file.local) {
          delete newProject.file.local
        }

        if (this.isNew) {
          project = await this.$http.post('/projects', newProject, {
            headers: {
              Authorization: token
            }
          }).then(response => response.data)
        } else {
          newProject.userId = this.project.userId
          newProject.createdAt = this.project.createdAt
          let presigned = true
          if (!this.project.file.local) {
            // no change to dataset
            presigned = false
            newProject.file = this.project.file
          }
          project = await this.$http.put(`/projects/${newProject.id}?presigned=${presigned}`, newProject, {
            headers: {
              Authorization: token
            }
          }).then(response => response.data)
        }
      } catch (e) {
        return this.setError(e)
      }

      // upload dataset
      if (project.presignedUrl) {
        try {
          const formData = new FormData()
          Object.keys(project.presignedUrl.fields).forEach((key) => {
            formData.append(key, project.presignedUrl.fields[key])
          })
          formData.append('file', this.project.file.local)

          await this.$http.post(project.presignedUrl.url, formData)
        } catch (e) {
          if (this.isNew) {
            this.$http.delete(`/projects/${project.id}`, {
              headers: {
                Authorization: token
              }
            })
          }
          return this.setError(e)
        }
      }

      this.setProject(project)
        .then(() => {
          this.status = 'SUCCESS'
        })
    },
    setError (e) {
      this.status = 'ERROR'
      this.serverError = this.$Amplify.I18n.get(e.message || e)
    }
  }
}
</script>
