<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">Change Password</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>
    <v-card-text>
      <v-text-field
        v-model="email"
        :error-messages="emailErrors"
        label="Email Address"
        required
        @input="$v.email.$touch()"
        @blur="$v.email.$touch()"
      ></v-text-field>
      <v-text-field
        v-model="oldPassword"
        :error-messages="oldPasswordErrors"
        label="Current Password"
        required
        type="password"
        @input="$v.oldPassword.$touch()"
        @blur="$v.oldPassword.$touch()"
      ></v-text-field>
      <v-text-field
        v-model="newPassword"
        :error-messages="newPasswordErrors"
        label="New Password"
        required
        type="password"
        @input="$v.newPassword.$touch()"
        @blur="$v.newPassword.$touch()"
      ></v-text-field>
      <v-text-field
        v-model="repeatPassword"
        :error-messages="repeatPasswordErrors"
        label="Confirm New Password"
        required
        type="password"
        @input="$v.repeatPassword.$touch()"
        @blur="$v.repeatPassword.$touch()"
      ></v-text-field>

      <v-alert type="error" :value="!!serverError">
        {{serverError}}
      </v-alert>

      Status: {{ submitStatus }}
    </v-card-text>

    <v-card-actions class="mx-4 pb-4">
      <v-btn color="primary" class="mr-4" :loading="submitStatus === 'PENDING'" @click="submit">submit</v-btn>
      <v-btn @click="clear">clear</v-btn>
      <v-spacer></v-spacer>
      <v-btn :to="{ name: 'account' }">cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, email, sameAs } from 'vuelidate/lib/validators'
import { AmplifyEventBus } from 'aws-amplify-vue'

export default {
  name: 'Login',
  mixins: [validationMixin],
  validations: {
    email: { required, email },
    oldPassword: { required },
    newPassword: { required },
    repeatPassword: { sameAsPassword: sameAs('newPassword') }
  },
  data () {
    return {
      submitStatus: 'READY',
      serverError: '',
      email: '',
      oldPassword: '',
      newPassword: '',
      repeatPassword: ''
      // email: 'jeff@walkerenvres.com',
      // oldPassword: 'walkerenvres',
      // newPassword: 'walkerenvres',
      // repeatPassword: 'walkerenvres'
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
    oldPasswordErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.oldPassword.required && errors.push('Current password is required')
      return errors
    },
    newPasswordErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.newPassword.required && errors.push('New password is required')
      return errors
    },
    repeatPasswordErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.repeatPassword.sameAsPassword && errors.push('New passwords do not match')
      return errors
    }
  },
  methods: {
    submit () {
      // console.log('submit', this.$v)
      this.$v.$touch()
      if (this.$v.$invalid) {
        this.submitStatus = 'INVALID'
      } else {
        // do your submit logic here
        this.submitStatus = 'PENDING'

        return this.$Amplify.Auth.currentAuthenticatedUser()
          .then(user => this.$Amplify.Auth.changePassword(user, this.oldPassword, this.newPassword))
          .then(data => {
            return AmplifyEventBus.$emit('authState', { state: 'signIn', redirect: { name: 'home' } })
          })
          .catch((e) => {
            this.setError(e)
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
      this.newPassword = ''
      this.oldPassword = ''
      this.repeatPassword = ''
      this.submitStatus = 'READY'
    }
  }
}
</script>
