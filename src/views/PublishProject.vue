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
      <v-text-field
        label="Enter project name"
        v-model="form.name"
        hint="Must be unique and will be used to generate a URL to this project"
        persistent-hint>
      </v-text-field>

      <v-text-field
        label="Enter project description"
        v-model="form.description"
        hint="Describe how and why this dataset was collected."
        persistent-hint>
      </v-text-field>

      <v-text-field
        label="Enter a project ID"
        v-model="projectId"
        hint="Must be unique and will be used to generate a URL to this project"
        persistent-hint>
      </v-text-field>

      <v-alert type="error" :value="!!serverError" outlined class="mt-4">
        {{serverError}}
      </v-alert>

      <v-alert type="success" v-if="status === 'SUCCESS'" outlined class="mt-4">
      <!-- <v-alert type="success" outlined class="mt-4"> -->
        Success! Your project has been published. <br><br>
        You can find it on the <router-link :to="{ name: 'listProjects' }">Projects List</router-link>, or you can access it directly using the following URL: <br><br>
        <pre class="grey--text text--darken-2">
          {{ projectUrl }}
        </pre>
      </v-alert>

      Status: {{ status }}
    </v-card-text>

    <v-card-actions class="mx-4 pb-4">
      <v-btn @click="submit" color="primary" class="mr-4" :loading="status === 'PENDING'" :disabled="status === 'SUCCESS'" v-if="user && project">submit</v-btn>
      <v-spacer></v-spacer>
      <v-btn to="/">close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
import slugify from 'slugify'
import uuidv4 from 'uuid/v4'

export default {
  name: 'PublishProject',
  data () {
    return {
      form: {
        name: '',
        description: ''
      },
      projectId: '',
      status: 'READY',
      serverError: null
    }
  },
  computed: {
    ...mapGetters(['user', 'project']),
    projectUrl () {
      const base = process.env.VUE_APP_BASE_URL || 'http://localhost:8080/'
      const route = this.$router.resolve({
        name: 'viewProject',
        params: { id: this.projectId }
      })
      return `${base}${route.href}`
    }
  },
  mounted () {
    if (this.project) {
      this.projectId = slugify(this.form.name, { lower: true, remove: /[*+~.,()'"!:@]/g })
    }
  },
  methods: {
    async submit () {
      this.status = 'PENDING'

      try {
        const response = await this.$Amplify.API.get('tame', `/projects/${this.projectId}`, {})
        if (response.status === 200) {
          return this.setError(`Project with ID '${this.projectId}' already exists, please try a different ID`)
        }
      } catch (e) {
      }

      try {
        const creds = await this.$Amplify.Auth.currentCredentials()
        console.log(creds)
        const identityId = creds.params.IdentityId

        const bucket = process.env.VUE_APP_S3_BUCKET
        const key = `${uuidv4()}.csv`

        await this.$Amplify.Storage.put(key, this.project.file, {
          level: 'protected',
          contentType: 'text/csv'
        })

        const newProject = {
          id: this.projectId,
          name: this.form.name,
          description: this.form.description,
          columns: this.project.columns,
          variables: this.project.variables,
          file: {
            url: `https://s3.amazonaws.com/${bucket}/protected/${identityId}/${key}`,
            identityId,
            key,
            originalFilename: this.project.file.name
          },
          userId: this.user.username
        }

        // const session = await this.$Amplify.Auth.currentSession()
        // const token = session.getIdToken().getJwtToken()
        const postResponse = await this.$Amplify.API.post('tame', '/projects', {
          body: newProject
        })
        console.log(postResponse.data)
        this.status = 'SUCCESS'
      } catch (e) {
        this.setError(e)
      }
    },
    setError (e) {
      this.status = 'ERROR'
      this.serverError = this.$Amplify.I18n.get(e.message || e)
    }
  }
}
</script>
