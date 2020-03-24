<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">My Account</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="pt-4 body-1">
      <p>
        Name: {{ user.attributes.name }}<br>
        Email: {{ user.attributes.email }}<br>
        Affiliation: {{ user.attributes['custom:affiliation'] }}
      </p>
      <v-btn color="primary" :to="{ name: 'changePassword' }">Change Password</v-btn>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="mx-4 py-4">
      <v-spacer></v-spacer>
      <v-btn text @click="$router.push({ name: 'home' })">close</v-btn>
    </v-card-actions>
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
