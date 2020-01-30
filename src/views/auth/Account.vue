<template>
  <v-card class="pa-4">
    <v-card-title primary-title>
      My Account
    </v-card-title>
    <v-card-text>
      Name: {{ user.attributes.name }}<br>
      Email: {{ user.attributes.email }}<br>
      Affiliation: {{ user.attributes.name }}<br>
      <v-btn color="primary" :to="{ name: 'changePassword' }" class="mt-8">Change Password</v-btn>
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
