<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-8">
      <span class="title">Logged Out</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>
    <v-card-text>
      <p>You have been logged out.</p>
      <p>This window will automatically close in 3 seconds...</p>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'Logout',
  data () {
    return {
      timeout: null
    }
  },
  mounted () {
    this.timeout = setTimeout(() => {
      this.$router.push({ name: 'home' })
    }, 3000)
  },
  beforeDestroy () {
    this.timeout && clearTimeout(this.timeout)
  }
}
</script>

<style>

</style>
