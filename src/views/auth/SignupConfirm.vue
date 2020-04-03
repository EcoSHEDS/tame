<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Verify Email</span>
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
          v-model="code"
          :error-messages="codeErrors"
          label="Verification Code"
          required
          hint="Check your email for the verification code"
          persistent-hint
        ></v-text-field>
        <v-btn hidden type="submit">submit</v-btn>
      </v-form>

      <v-alert type="error" :value="!!serverError" outlined dense class="mt-4">
        <div class="font-weight-bold">Server Error</div>
        {{serverError}}
      </v-alert>

      <div class="mt-4">
        <a @click="resend">Can't find your code? Request a new one.</a>
        <v-alert type="info" outlined dense class="mt-4" v-if="resendCode">
          <div class="font-weight-bold">Request submitted, check your email for a new code.</div>
        </v-alert>
      </div>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="mx-4 py-4">
      <v-btn @click="submit" color="primary" class="mr-4" :loading="submitStatus === 'PENDING'">submit</v-btn>
      <v-btn text @click="clear">clear</v-btn>
      <v-spacer></v-spacer>
      <v-btn text :to="{ name: 'login' }">cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'
import { AmplifyEventBus } from 'aws-amplify-vue'

export default {
  name: 'SignUp',
  mixins: [validationMixin],
  validations: {
    email: { required, email },
    code: { required }
  },
  data () {
    return {
      submitStatus: 'READY',
      serverError: '',
      resendCode: false,
      email: '',
      code: ''
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
      if (this.submitStatus === 'READY' || this.submitStatus === 'RESEND') return errors
      !this.$v.code.required && errors.push('Code is required.')
      return errors
    }
  },
  mounted () {
    if (this.$parent.user) {
      this.email = this.$parent.user.username
    }
  },
  methods: {
    submit () {
      // console.log('submit', this.$v)
      this.$v.$touch()
      this.serverError = null
      if (this.$v.$invalid) {
        this.submitStatus = 'ERROR'
      } else {
        this.submitStatus = 'PENDING'
        this.$Amplify.Auth.confirmSignUp(this.email, this.code)
          .then(data => {
            // AmplifyEventBus.$emit('localUser', data.user)
            // console.log('SignupConfirm:submit:success', data)
            if (data.userConfirmed === false) {
              return AmplifyEventBus.$emit('authState', { state: 'confirmSignUp' })
            } else if (this.$parent.user && this.$parent.user.username && this.$parent.user.password) {
              // auto-sign in using password from Signup form
              return this.$Amplify.Auth.signIn(this.$parent.user.username, this.$parent.user.password)
                .then((data) => {
                  AmplifyEventBus.$emit('authState', { state: 'signIn', redirect: { name: 'welcome' } })
                })
            }
            return AmplifyEventBus.$emit('authState', { state: 'signIn', redirect: { name: 'login' } })
          })
          .catch(e => this.setError(e))
      }
    },
    resend () {
      if (this.$v.email.$invalid) {
        this.submitStatus = 'RESEND'
      } else {
        this.$Amplify.Auth.resendSignUp(this.email)
          .then(() => {
            this.resendCode = true
          })
          .catch(e => this.setError(e))
      }
    },
    setError (e) {
      // console.log('SignupConfirm:submit:error', e)
      this.submitStatus = 'ERROR'
      this.serverError = this.$Amplify.I18n.get(e.message || e)
    },
    clear () {
      this.$v.$reset()
      this.name = ''
      this.email = ''
      this.password = ''
      this.repeatPassword = ''
      this.submitStatus = 'READY'
      this.serverError = null
    }
  }
}
</script>
