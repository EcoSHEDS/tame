<template>
  <v-card class="pa-4">
    <v-card-title primary-title>
      Log In
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="email"
          :error-messages="emailErrors"
          label="Email Address"
          required
          @input="$v.email.$touch()"
          @blur="$v.email.$touch()"
        ></v-text-field>
        <v-text-field
          v-model="password"
          :error-messages="passwordErrors"
          label="Password"
          required
          type="password"
          @input="$v.password.$touch()"
          @blur="$v.password.$touch()"
        ></v-text-field>

        <div class="mt-4">
          <v-btn type="submit" color="primary" class="mr-4" :loading="submitStatus === 'PENDING'">submit</v-btn>
          <v-btn @click="clear">clear</v-btn>
        </div>
      </v-form>

      <v-alert type="error" :value="!!serverError" outlined class="mt-8">
        {{serverError}}
      </v-alert>

      <div class="mt-8">
        <router-link :to="{ name: 'resetPassword' }">Forgot your password?</router-link><br>
        <router-link :to="{ name: 'signup' }">Don't have an account?</router-link>
      </div>

      Status: {{ submitStatus }}
    </v-card-text>
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
      // email: '',
      // password: ''
      email: 'jeff@walkerenvres.com',
      password: 'walkerenvres'
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
      console.log('submit', this.$v)
      this.$v.$touch()
      if (this.$v.$invalid) {
        this.submitStatus = 'INVALID'
      } else {
        // do your submit logic here
        this.submitStatus = 'PENDING'

        this.$Amplify.Auth.signIn(this.email, this.password)
          .then(data => {
            if (data.challengeName === 'SMS_MFA' || data.challengeName === 'SOFTWARE_TOKEN_MFA') {
              AmplifyEventBus.$emit('localUser', data)
              return AmplifyEventBus.$emit('authState', { state: 'confirmSignIn' })
            } else if (data.challengeName === 'NEW_PASSWORD_REQUIRED') {
              AmplifyEventBus.$emit('localUser', data)
              return AmplifyEventBus.$emit('authState', { state: 'requireNewPassword' })
            } else if (data.challengeName === 'MFA_SETUP') {
              AmplifyEventBus.$emit('localUser', data)
              return AmplifyEventBus.$emit('authState', { state: 'setMfa' })
            } else if (
              data.challengeName === 'CUSTOM_CHALLENGE' &&
              data.challengeParam &&
              data.challengeParam.trigger === 'true'
            ) {
              AmplifyEventBus.$emit('localUser', data)
              return AmplifyEventBus.$emit('authState', { state: 'customConfirmSignIn' })
            } else {
              return AmplifyEventBus.$emit('authState', { state: 'signIn', redirect: { name: 'home' } })
            }
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
      }
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
