<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Sign Up</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="pt-8">
      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="email"
          :error-messages="emailErrors"
          label="Email Address"
          required
        ></v-text-field>
        <v-text-field
          v-model="name"
          :error-messages="nameErrors"
          label="Name"
          required
        ></v-text-field>
        <v-text-field
          v-model="affiliation"
          :error-messages="affiliationErrors"
          label="Affiliation (optional)"
        ></v-text-field>
        <v-text-field
          v-model="password"
          :error-messages="passwordErrors"
          label="Password"
          required
          type="password"
        ></v-text-field>
        <v-text-field
          v-model="repeatPassword"
          :error-messages="repeatPasswordErrors"
          label="Confirm Password"
          required
          type="password"
        ></v-text-field>
        <v-btn hidden type="submit">submit</v-btn>
      </v-form>

      <v-alert type="error" :value="!!serverError" outlined prominent>
        <div class="title">Server Error</div>
        {{serverError}}
      </v-alert>

      <div class="mt-4">
        <router-link :to="{ name: 'login' }">Already have an account?</router-link>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="mx-4 py-4">
      <v-btn @click="submit" color="primary" class="mr-4" :loading="submitStatus === 'PENDING'">submit</v-btn>
      <v-btn text @click="clear">clear</v-btn>
      <v-spacer></v-spacer>
      <v-btn text @click="$router.push({ name: 'home' })">cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, minLength, maxLength, email, sameAs } from 'vuelidate/lib/validators'
import { AmplifyEventBus } from 'aws-amplify-vue'

import { passwordStrength } from '@/lib/validators'

export default {
  name: 'SignUp',
  mixins: [validationMixin],
  validations: {
    name: { required },
    email: { required, email },
    affiliation: { maxLength: maxLength(25) },
    password: { required, minLength: minLength(8), maxLength: maxLength(32), passwordStrength },
    repeatPassword: { sameAsPassword: sameAs('password') }
  },
  data () {
    return {
      submitStatus: 'READY',
      serverError: '',
      name: '',
      affiliation: '',
      email: '',
      password: '',
      repeatPassword: ''
    }
  },
  computed: {
    nameErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.name.required && errors.push('Name is required.')
      return errors
    },
    emailErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.email.email && errors.push('Must be valid e-mail')
      !this.$v.email.required && errors.push('E-mail is required')
      return errors
    },
    affiliationErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.affiliation.maxLength && errors.push('Cannot be more than 50 characters')
      return errors
    },
    passwordErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.password.required && errors.push('Password is required')
      !this.$v.password.minLength && errors.push('Must be at least 8 characters')
      !this.$v.password.maxLength && errors.push('Cannot be more than 32 characters')
      !this.$v.password.passwordStrength && errors.push('Must contain at least one lowercase letter, one uppercase letter and one number.')
      return errors
    },
    repeatPasswordErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.repeatPassword.sameAsPassword && errors.push('Passwords do not match')
      return errors
    }
  },
  methods: {
    submit () {
      this.$v.$touch()
      this.serverError = null

      if (this.$v.$invalid) {
        this.submitStatus = 'ERROR'
      } else {
        this.submitStatus = 'PENDING'
        const user = {
          username: this.email,
          password: this.password,
          attributes: {
            email: this.email,
            name: this.name,
            'custom:affiliation': this.affiliation
          }
        }
        this.$Amplify.Auth.signUp(user)
          .then(data => {
            data.user.password = user.password
            AmplifyEventBus.$emit('localUser', data.user)
            if (data.userConfirmed === false) {
              return AmplifyEventBus.$emit('authState', { state: 'confirmSignUp' })
            }
            return AmplifyEventBus.$emit('authState', { state: 'signIn', redirect: { name: 'login' } })
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
      this.password = ''
      this.repeatPassword = ''
      this.submitStatus = 'READY'
    }
  }
}
</script>
