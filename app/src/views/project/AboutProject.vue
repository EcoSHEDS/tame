<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Project Information</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="body-1 py-6 black--text" v-if="project">
      <v-row no-gutters class="my-2">
        <v-col cols="2" class="text-right pr-4">Name:</v-col>
        <v-col class="font-weight-bold">{{ project.name }}</v-col>
      </v-row>
      <v-row no-gutters class="my-2">
        <v-col cols="2" class="text-right pr-4">URL:</v-col>
        <v-col class="font-weight-bold"><a :href="projectUrl">{{ projectUrl }}</a></v-col>
      </v-row>
      <v-row no-gutters class="my-2">
        <v-col cols="2" class="text-right pr-4">Created:</v-col>
        <v-col class="font-weight-bold">{{ project.createdAt | moment('MMMM DD, YYYY') }}</v-col>
      </v-row>
      <v-row no-gutters class="my-2">
        <v-col cols="2" class="text-right pr-4">Last Update:</v-col>
        <v-col class="font-weight-bold">{{ project.updatedAt | moment('from') }}</v-col>
      </v-row>
      <v-row no-gutters class="my-2">
        <v-col cols="2" class="text-right pr-4">Published:</v-col>
        <v-col class="font-weight-bold">{{ project.publish ? 'Yes' : 'No' }}</v-col>
      </v-row>
      <v-row no-gutters class="my-2">
        <v-col cols="2" class="text-right pr-4">Description:</v-col>
        <v-col class="font-weight-bold">{{ project.description }}</v-col>
      </v-row>
      <v-row no-gutters class="my-2">
        <v-col cols="2" class="text-right pr-4">Data Citation:</v-col>
        <v-col class="font-weight-bold">{{ project.citation }}<span v-if="!project.citation">None</span></v-col>
      </v-row>
    </v-card-text>
    <v-card-text v-else class="py-8 black--text">
      <v-alert type="error" dense text border="left">
        <div class="body-1 font-weight-bold">Project Not Found</div>
        <div>Return to the <router-link :to="{ name: 'welcome' }">Welcome</router-link> screen</div>
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
  name: 'ProjectInfo',
  computed: {
    ...mapGetters(['project']),
    projectUrl () {
      const base = process.env.VUE_APP_BASE_URL || 'http://localhost:8080/'
      const route = this.$router.resolve({
        name: 'loadProject',
        params: { id: this.project.id }
      })
      return `${base}${route.href}`
    }
  }
}
</script>
