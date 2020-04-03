<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Log In</span>
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
          v-model="password"
          :error-messages="passwordErrors"
          label="Password"
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
        <router-link :to="{ name: 'resetPassword' }">Forgot your password?</router-link><br>
        <router-link :to="{ name: 'signup' }">Don't have an account?</router-link>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="mx-4 py-4">
      <v-btn @click="submit" color="primary" class="mr-4" :loading="submitStatus === 'PENDING'">submit</v-btn>
      <v-btn text @click="clear">clear</v-btn>
      <v-spacer></v-spacer>
      <v-btn text @click="$router.push({ name: 'home' })">close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'
import { AmplifyEventBus } from 'aws-amplify-vue'

export default {
  name: 'Login',
  mixins: [validationMixin],
  validations: {
    email: { required, email },
    password: { required }
  },
  data () {
    return {
      submitStatus: 'READY',
      serverError: '',
      email: '',
      password: ''
      // email: 'jeff@walkerenvres.com',
      // password: 'walkerenvres'
    }
  },
  computed: {
    emailErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.email.email && errors.push('Must be valid e-mail')
      !this.$v.email.required && errors.push('E-mail is required')
      return errors
    },
    passwordErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.password.required && errors.push('Password is required')
      return errors
    }
  },
  methods: {
    submit () {
      this.serverError = null

      this.$v.$touch()
      if (this.$v.$invalid) {
        this.submitStatus = 'INVALID'
        return
      }

      this.submitStatus = 'PENDING'
      this.$Amplify.Auth.signIn(this.email, this.password)
        .then(user => {
          const redirect = this.$store.getters.project ? 'home' : 'welcome'
          return AmplifyEventBus.$emit('authState', { state: 'signIn', redirect: { name: redirect } })
        })
        .catch((e) => {
          if (e.code && e.code === 'UserNotConfirmedException') {
            AmplifyEventBus.$emit('localUser', { username: this.username })
            AmplifyEventBus.$emit('authState', { state: 'confirmSignUp' })
          } else {
            this.setError(e)
          }
          this.submitStatus = 'ERROR'
        })
    },
    setError (e) {
      this.serverError = this.$Amplify.I18n.get(e.message || e)
    },
    clear () {
      this.$v.$reset()
      this.email = ''
      this.password = ''
      this.submitStatus = 'READY'
    }
  }
}
</script>
