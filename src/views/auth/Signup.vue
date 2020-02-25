<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">Sign Up</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>
    <v-card-text>
      <v-text-field
        v-model="name"
        :error-messages="nameErrors"
        label="Name"
        required
        @input="$v.name.$touch()"
        @blur="$v.name.$touch()"
      ></v-text-field>
      <v-text-field
        v-model="email"
        :error-messages="emailErrors"
        label="Email Address"
        required
        @input="$v.email.$touch()"
        @blur="$v.email.$touch()"
      ></v-text-field>
      <v-text-field
        v-model="affiliation"
        label="Affiliation (optional)"
        @input="$v.affiliation.$touch()"
        @blur="$v.affiliation.$touch()"
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
      <v-text-field
        v-model="repeatPassword"
        :error-messages="repeatPasswordErrors"
        label="Confirm Password"
        required
        type="password"
        @input="$v.repeatPassword.$touch()"
        @blur="$v.repeatPassword.$touch()"
      ></v-text-field>

      <v-alert type="error" :value="!!serverError" class="mt-8">
        {{serverError}}
      </v-alert>

      <div class="mt-8">
        <router-link :to="{ name: 'login' }">Already have an account?</router-link>
      </div>

      Status: {{ submitStatus }}
    </v-card-text>
    <v-card-actions class="mx-4 pb-4">
      <v-btn @click="submit" color="primary" class="mr-4" :loading="submitStatus === 'PENDING'">submit</v-btn>
      <v-btn @click="clear">clear</v-btn>
      <v-spacer></v-spacer>
      <v-btn @click="$router.push({ name: 'home' })">cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, minLength, email, sameAs } from 'vuelidate/lib/validators'
import { AmplifyEventBus } from 'aws-amplify-vue'

export default {
  name: 'SignUp',
  mixins: [validationMixin],
  validations: {
    name: { required },
    email: { required, email },
    affiliation: {},
    password: { required, minLength: minLength(6) },
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
      // name: 'Jeff Walker',
      // affiliation: 'WalkerEnvRes',
      // email: 'jeff@walkerenvres.com',
      // password: 'walkerenvres',
      // repeatPassword: 'walkerenvres'
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
    passwordErrors () {
      const errors = []
      if (this.submitStatus === 'READY') return errors
      !this.$v.password.required && errors.push('Password is required')
      !this.$v.password.minLength && errors.push('Password must be at least 6 characters')
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
      console.log('submit', this.$v)
      this.$v.$touch()
      if (this.$v.$invalid) {
        this.submitStatus = 'ERROR'
      } else {
        // do your submit logic here
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
        console.log('signup:user', user)
        this.$Amplify.Auth.signUp(user)
          .then(data => {
            console.log('Signup:submit:success', data)
            data.user.password = user.password
            AmplifyEventBus.$emit('localUser', data.user)
            if (data.userConfirmed === false) {
              return AmplifyEventBus.$emit('authState', { state: 'confirmSignUp' })
            }
            return AmplifyEventBus.$emit('authState', { state: 'signIn' })
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
