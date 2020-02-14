<template>
  <v-container>
    <v-layout row wrap style="max-width:500px" mx-auto class="mt-8">
      <v-row>
        <v-col>
          <v-card class="pa-4">
            <v-card-title primary-title>
              Create New Project
            </v-card-title>
            <v-card-text>
              <v-form @submit.prevent="submit">
                <v-text-field
                  v-model="id"
                  :error-messages="idErrors"
                  label="ID"
                  required
                  @input="$v.id.$touch()"
                  @blur="$v.id.$touch()"
                ></v-text-field>
                <v-text-field
                  v-model="name"
                  :error-messages="nameErrors"
                  label="Name"
                  required
                  @input="$v.name.$touch()"
                  @blur="$v.name.$touch()"
                ></v-text-field>
                <v-textarea
                  v-model="description"
                  :error-messages="descriptionErrors"
                  label="Brief Description"
                  required
                  rows="2"
                  @input="$v.description.$touch()"
                  @blur="$v.description.$touch()"
                ></v-textarea>

                <div class="mt-4">
                  <v-btn type="submit" color="primary" class="mr-4" :loading="submitStatus === 'PENDING'">submit</v-btn>
                  <v-btn @click="clear">clear</v-btn>
                </div>
              </v-form>

              <v-alert type="error" :value="!!serverError" class="mt-8">
                {{serverError}}
              </v-alert>

              Status: {{ submitStatus }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-layout>
  </v-container>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'

export default {
  name: 'SignUp',
  mixins: [validationMixin],
  validations: {
    id: { required },
    name: { required },
    description: { required }
  },
  data () {
    return {
      submitStatus: 'READY',
      serverError: '',
      // id: '',
      // name: '',
      // affiliation: '',
      // email: '',
      // password: '',
      // repeatPassword: ''
      id: 'deerfield',
      name: 'Deerfield Telemetry',
      description: 'A brief description'
    }
  },
  computed: {
    ...mapGetters(['user']),
    idErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.id.required && errors.push('ID is required.')
      return errors
    },
    nameErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.name.required && errors.push('Name is required.')
      return errors
    },
    descriptionErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.description.required && errors.push('Description is required.')
      return errors
    }
  },
  methods: {
    submit () {
      this.$v.$touch()
      if (this.$v.$invalid) {
        this.submitStatus = 'ERROR'
        return
      }
      // do your submit logic here
      this.submitStatus = 'PENDING'
      const project = {
        id: this.id,
        name: this.name,
        description: this.description
      }
      this.$Amplify.Auth.currentSession()
        .then(data => data.getIdToken().getJwtToken())
        .then((token) => this.$http.post('/projects', project, {
          headers: {
            Authorization: token
          }
        }))
        .then(data => {
          console.log('success', data)
          this.$router.push({ name: 'projects' })
        })
        .catch(e => this.setError(e))
    },
    setError (e) {
      this.submitStatus = 'ERROR'
      this.serverError = this.$Amplify.I18n.get(e.message || e)
    },
    clear () {
      this.$v.$reset()
      this.id = ''
      this.name = ''
      this.description = ''
      this.submitStatus = 'READY'
    }
  }
}
</script>
