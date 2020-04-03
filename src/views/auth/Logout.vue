<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Logged Out</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="body-1 py-8">
      <v-alert type="success" outlined prominent color="grey darken-1" class="mb-0">
        <div class="title">You have been logged out.</div>
        This window will automatically close in {{ count }} seconds...
      </v-alert>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="mx-4">
      <v-spacer></v-spacer>
      <v-btn to="/" text>close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Logout',
  data () {
    return {
      timeout: null,
      count: 3
    }
  },
  computed: {
    ...mapGetters(['project'])
  },
  created () {
    this.countDownTimer()
  },
  beforeDestroy () {
    this.timeout && clearTimeout(this.timeout)
  },
  methods: {
    countDownTimer () {
      if (this.count > 0) {
        this.timeout = setTimeout(() => {
          this.count -= 1
          this.countDownTimer()
        }, 1000)
      } else {
        if (this.project) {
          this.$router.push({ name: 'home' })
        } else {
          this.$router.push({ name: 'welcome' })
        }
      }
    }
  }
}
</script>
