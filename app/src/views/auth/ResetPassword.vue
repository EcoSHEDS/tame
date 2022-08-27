<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Request Password Reset</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-form @submit.prevent="submit" :disabled="submitStatus === 'PENDING'">
      <v-card-text class="pt-8">
        <v-text-field
          v-model="email"
          :error-messages="emailErrors"
          label="Email Address"
          required
          hint="Enter your email address and click Submit to request a password reset."
          persistent-hint
        ></v-text-field>

        <v-alert type="success" :value="requestSent" dense text border="left" class="mt-4 body-2">
          <div class="body-1 font-weight-bold">Request submitted</div>
          <div>Check your email for the verification code, and then set a new password.</div>
        </v-alert>

        <v-text-field
          v-if="requestSent"
          v-model="code"
          :error-messages="codeErrors"
          label="Verification Code"
          required
        ></v-text-field>
        <v-text-field
          v-if="requestSent"
          v-model="password"
          :error-messages="passwordErrors"
          label="Password"
          required
          type="password"
        ></v-text-field>
        <v-text-field
          v-if="requestSent"
          v-model="repeatPassword"
          :error-messages="repeatPasswordErrors"
          label="Confirm Password"
          required
          type="password"
        ></v-text-field>

        <v-alert type="error" :value="!!serverError" dense text border="left" class="mt-4 body-2">
          <div class="body-1 font-weight-bold">Server Error</div>
          <div>{{serverError}}</div>
        </v-alert>

        <v-alert type="success" :value="submitStatus === 'SUCCESS'" dense text border="left" class="mt-4 mb-0 body-2">
          <div class="body-1 font-weight-bold">Password has been reset</div>
          <div>You will be automatically transfered to the <router-link :to="{ name: 'login' }">Login screen</router-link>
          in {{ count }} seconds...</div>
        </v-alert>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="mx-4 py-4">
        <v-btn type="submit" color="primary" class="mr-4" :loading="submitStatus === 'PENDING'" :disabled="submitStatus === 'SUCCESS'">submit</v-btn>
        <v-btn text @click="clear">clear</v-btn>
        <v-spacer></v-spacer>
        <v-btn text :to="{ name: 'login' }">cancel</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, minLength, maxLength, email, sameAs } from 'vuelidate/lib/validators'

import { passwordStrength } from '@/lib/validators'

export default {
  name: 'ResetPassword',
  mixins: [validationMixin],
  validations: {
    email: { required, email },
    code: { required },
    password: { required, minLength: minLength(8), maxLength: maxLength(32), passwordStrength },
    repeatPassword: { sameAsPassword: sameAs('password') }
  },
  data () {
    return {
      submitStatus: 'READY',
      requestSent: false,
      serverError: '',
      email: '',
      code: '',
      password: '',
      repeatPassword: '',
      count: 3,
      timeout: null
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
    codeErrors () {
      const errors = []
      if (this.submitStatus === 'READY' || !this.requestSent) return errors
      !this.$v.code.required && errors.push('Code is required.')
      return errors
    },
    passwordErrors () {
      const errors = []
      if (this.submitStatus === 'READY' || !this.requestSent) return errors
      !this.$v.password.required && errors.push('Password is required')
      !this.$v.password.minLength && errors.push('Must be at least 8 characters')
      !this.$v.password.maxLength && errors.push('Cannot be more than 32 characters')
      !this.$v.password.passwordStrength && errors.push('Must contain at least one lowercase letter, one uppercase letter and one number.')
      return errors
    },
    repeatPasswordErrors () {
      const errors = []
      if (this.submitStatus === 'READY' || !this.requestSent) return errors
      !this.$v.repeatPassword.sameAsPassword && errors.push('Passwords do not match')
      return errors
    }
  },
  beforeDestroy () {
    this.timeout && clearTimeout(this.timeout)
  },
  methods: {
    submit () {
      this.$v.$touch()
      this.serverError = null

      if (!this.requestSent) {
        if (this.$v.email.$invalid) {
          this.submitStatus = 'ERROR'
        } else {
          this.submitStatus = 'PENDING'
          return this.$Amplify.Auth.forgotPassword(this.email)
            .then(data => {
              this.submitStatus = 'READY'
              this.requestSent = true
              this.serverError = ''
            })
            .catch(e => this.setError(e))
        }
      } else {
        if (this.$v.$invalid) {
          this.submitStatus = 'ERROR'
        } else {
          this.submitStatus = 'PENDING'
          this.serverError = ''
          return this.$Amplify.Auth.forgotPasswordSubmit(this.email, this.code, this.password)
            .then(data => {
              this.submitStatus = 'SUCCESS'
              this.countDownTimer()
            })
            .catch(e => this.setError(e))
        }
      }
    },
    countDownTimer () {
      if (this.count > 0) {
        this.timeout = setTimeout(() => {
          this.count -= 1
          this.countDownTimer()
        }, 1000)
      } else {
        this.$router.push({ name: 'login' })
      }
    },
    setError (e) {
      this.submitStatus = 'ERROR'
      this.serverError = this.$Amplify.I18n.get(e.message || e)
    },
    clear () {
      this.$v.$reset()
      this.email = ''
      this.code = ''
      this.password = ''
      this.repeatPassword = ''
      this.requestSent = false
      this.submitStatus = 'READY'
      this.serverError = null
    }
  }
}
</script>
