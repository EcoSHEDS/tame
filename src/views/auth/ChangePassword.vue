<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Change Password</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="pt-8">
      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="oldPassword"
          :error-messages="oldPasswordErrors"
          label="Current Password"
          required
          type="password"
        ></v-text-field>
        <v-text-field
          v-model="newPassword"
          :error-messages="newPasswordErrors"
          label="New Password"
          required
          type="password"
        ></v-text-field>
        <v-text-field
          v-model="repeatPassword"
          :error-messages="repeatPasswordErrors"
          label="Confirm New Password"
          required
          type="password"
        ></v-text-field>
        <v-btn hidden type="submit">submit</v-btn>
      </v-form>

      <v-alert type="error" :value="!!serverError" outlined dense class="mt-4 mb-0">
        <div class="font-weight-bold">Server Error</div>
        {{serverError}}
      </v-alert>
      <v-alert type="success" :value="submitStatus === 'SUCCESS'" outlined dense class="mt-4 mb-0">
        <div class="font-weight-bold">New Password Saved</div>
        Redirecting back to <span class="font-weight-medium">My Account</span> in {{ count }}...
      </v-alert>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="mx-4 py-4">
      <v-btn :disabled="submitStatus === 'SUCCESS'" @click="submit" color="primary" class="mr-4" :loading="submitStatus === 'PENDING'">submit</v-btn>
      <v-spacer></v-spacer>
      <v-btn text :to="{ name: 'account' }">cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, sameAs, minLength, maxLength } from 'vuelidate/lib/validators'
import { AmplifyEventBus } from 'aws-amplify-vue'

import { passwordStrength } from '@/lib/validators'

export default {
  name: 'Login',
  mixins: [validationMixin],
  validations: {
    oldPassword: { required },
    newPassword: { required, minLength: minLength(8), maxLength: maxLength(32), passwordStrength },
    repeatPassword: { sameAsPassword: sameAs('newPassword') }
  },
  data () {
    return {
      submitStatus: 'READY',
      serverError: '',
      oldPassword: '',
      newPassword: '',
      repeatPassword: '',
      timeout: null,
      count: 3
    }
  },
  computed: {
    oldPasswordErrors () {
      const errors = []
      if (this.submitStatus === 'READY' || this.submitStatus === 'SUCCESS') return errors
      !this.$v.oldPassword.required && errors.push('Current password is required')
      return errors
    },
    newPasswordErrors () {
      const errors = []
      if (this.submitStatus === 'READY' || this.submitStatus === 'SUCCESS') return errors
      !this.$v.newPassword.required && errors.push('Password is required')
      !this.$v.newPassword.minLength && errors.push('Must be at least 8 characters')
      !this.$v.newPassword.maxLength && errors.push('Cannot be more than 32 characters')
      !this.$v.newPassword.passwordStrength && errors.push('Must contain at least one lowercase letter, one uppercase letter and one number.')
      return errors
    },
    repeatPasswordErrors () {
      const errors = []
      if (this.submitStatus === 'READY' || this.submitStatus === 'SUCCESS') return errors
      !this.$v.repeatPassword.sameAsPassword && errors.push('New passwords do not match')
      return errors
    }
  },
  beforeDestroy () {
    this.timeout && clearTimeout(this.timeout)
  },
  methods: {
    submit () {
      // console.log('submit', this.$v)
      this.$v.$touch()
      this.serverError = null
      if (this.$v.$invalid) {
        this.submitStatus = 'INVALID'
      } else {
        this.submitStatus = 'PENDING'

        return this.$Amplify.Auth.currentAuthenticatedUser()
          .then(user => this.$Amplify.Auth.changePassword(user, this.oldPassword, this.newPassword))
          .then(data => {
            this.clear()
            this.submitStatus = 'SUCCESS'
            this.countDownTimer()
          })
          .catch((e) => {
            this.setError(e)
            this.submitStatus = 'ERROR'
          })
      }
    },
    countDownTimer () {
      if (this.count > 0) {
        this.timeout = setTimeout(() => {
          this.count -= 1
          this.countDownTimer()
        }, 1000)
      } else {
        AmplifyEventBus.$emit('authState', { state: 'signIn', redirect: { name: 'account' } })
      }
    },
    setError (e) {
      this.serverError = this.$Amplify.I18n.get(e.message || e)
    },
    clear () {
      this.$v.$reset()
      this.newPassword = ''
      this.oldPassword = ''
      this.repeatPassword = ''
      this.submitStatus = 'READY'
    }
  }
}
</script>
