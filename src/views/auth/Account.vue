<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">My Account</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>
    <v-card-text>
      Name: {{ user.attributes.name }}<br>
      Email: {{ user.attributes.email }}<br>
      Affiliation: {{ user.attributes['custom:affiliation'] }}<br>
      <v-btn color="default" :to="{ name: 'changePassword' }" class="mt-8">Change Password</v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Account',
  computed: {
    ...mapGetters(['user'])
  },
  mounted () {
    if (!this.user) {
      this.$router.push({ name: 'login' })
    }
  }
}
</script>
