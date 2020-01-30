<template>
  <v-card>
    <v-card-title primary-title>
      Logged Out
    </v-card-title>
    <v-card-text>
      <p>You have been logged out.</p>
      <p>Automatically redirecting in 3 seconds...</p>
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
