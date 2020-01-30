<template>
  <v-card class="pa-4">
    <v-card-title primary-title>
      Reset Password
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
          v-if="requestSent"
          v-model="code"
          :error-messages="codeErrors"
          label="Verification Code"
          required
          @input="$v.code.$touch()"
          @blur="$v.code.$touch()"
        ></v-text-field>
        <v-text-field
          v-if="requestSent"
          v-model="password"
          :error-messages="passwordErrors"
          label="Password"
          required
          type="password"
          @input="$v.password.$touch()"
          @blur="$v.password.$touch()"
        ></v-text-field>
        <v-text-field
          v-if="requestSent"
          v-model="repeatPassword"
          :error-messages="repeatPasswordErrors"
          label="Confirm Password"
          required
          type="password"
          @input="$v.repeatPassword.$touch()"
          @blur="$v.repeatPassword.$touch()"
        ></v-text-field>

        <div class="mt-4">
          <v-btn type="submit" color="primary" class="mr-4" :loading="submitStatus === 'PENDING'">submit</v-btn>
          <v-btn @click="clear">clear</v-btn>
        </div>
      </v-form>

      <v-alert type="error" :value="!!serverError" class="mt-8">
        {{serverError}}
      </v-alert>

      <v-alert type="info" outlined :value="requestSent" class="mt-8">
        Request submitted, check your email for the verification code and set a new password.
      </v-alert>

      Status: {{ submitStatus }}
    </v-card-text>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, minLength, email, sameAs } from 'vuelidate/lib/validators'
import { AmplifyEventBus } from 'aws-amplify-vue'

export default {
  name: 'ResetPassword',
  mixins: [validationMixin],
  validations: {
    email: { required, email },
    code: { required },
    password: { required, minLength: minLength(6) },
    repeatPassword: { sameAsPassword: sameAs('password') }
  },
  data () {
    return {
      submitStatus: 'READY',
      requestSent: false,
      serverError: '',
      // email: '',
      // code: '',
      // password: '',
      // repeatPassword: ''
      email: 'jeff@walkerenvres.com',
      code: '',
      password: 'walkerenvres',
      repeatPassword: 'walkerenvres'
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
      !this.$v.password.minLength && errors.push('Password must be at least 6 characters')
      return errors
    },
    repeatPasswordErrors () {
      const errors = []
      if (this.submitStatus === 'READY' || !this.requestSent) return errors
      !this.$v.repeatPassword.sameAsPassword && errors.push('Passwords do not match')
      return errors
    }
  },
  methods: {
    submit () {
      console.log('submit', this.$v)
      this.$v.$touch()
      if (!this.requestSent) {
        if (this.$v.email.$invalid) {
          this.submitStatus = 'ERROR'
        } else {
          this.submitStatus = 'PENDING'
          return this.$Amplify.Auth.forgotPassword(this.email)
            .then(data => {
              console.log('ResetPassword:submitRequest:success', data)
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
              console.log('ResetPassword:submitPassword:success', data)
              return this.$Amplify.Auth.signIn(this.email, this.password)
                .then((data) => {
                  AmplifyEventBus.$emit('authState', { state: 'signIn' })
                  this.submitStatus = 'READY'
                })
            })
            .catch(e => this.setError(e))
        }
      }
    },
    setError (e) {
      this.submitStatus = 'ERROR'
      this.serverError = this.$Amplify.I18n.get(e.message || e)
    },
    clear () {
      this.$v.$reset()
      this.email = ''
      this.password = ''
      this.repeatPassword = ''
      this.submitStatus = 'READY'
    }
  }
}
</script>
