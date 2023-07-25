<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <span class="title">Available Projects</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>
    <v-card-text v-if="status === 'loading'" class="pt-8">
      <v-progress-circular :size="32" :width="5" indeterminate color="primary"></v-progress-circular>
      <span class="headline ml-4" style="vertical-align:middle">Loading Projects...</span>
    </v-card-text>
    <v-card-text v-else-if="status === 'error'" class="pt-8">
      <v-alert type="error" outlined prominent>
        <div class="title">Failed to load projects from server.</div>
      </v-alert>
    </v-card-text>
    <v-card-text v-else-if="status === 'ready'" class="py-4">
      <v-data-iterator
        :items="displayProjects"
        :items-per-page.sync="itemsPerPage"
        :page.sync="page"
        :search="search"
        :sort-by="sortBy.toLowerCase()"
        :sort-desc="sortDesc"
        hide-default-footer
        @current-items="currentItems"
        ref="dataIterator"
      >
        <template v-slot:header>
          <div class="d-flex">
            <v-text-field
              v-model="search"
              clearable
              outlined
              hide-details
              prepend-inner-icon="mdi-magnify"
              label="Search"
            ></v-text-field>
            <v-select
              v-model="sortBy"
              text
              flat
              hide-details
              :items="keys"
              item-text="label"
              item-value="key"
              :prepend-inner-icon="sortDesc ? 'mdi-sort-ascending' : 'mdi-sort-descending'"
              label="Sort by"
              class="ml-8"
              style="max-width:200px"
            ></v-select>
            <v-btn-toggle
              v-model="sortDesc"
              mandatory
              class="ml-2 align-self-center"
            >
              <v-btn
                large
                depressed
                color="gray lighten-2"
                :value="false"
              >
                <v-icon>mdi-arrow-up</v-icon>
              </v-btn>
              <v-btn
                large
                depressed
                color="gray lighten-2"
                :value="true"
              >
                <v-icon>mdi-arrow-down</v-icon>
              </v-btn>
            </v-btn-toggle>
          </div>
          <div v-if="!user" class="body-2 mt-2 black--text">
            <router-link :to="{name: 'login'}">Login</router-link> to see your projects
          </div>
          <div v-else>
            <v-switch v-model="userProjectsOnly" label="Only my projects" hide-details></v-switch>
          </div>
        </template>

        <template v-slot:no-results>
          <v-alert type="error" title="No Projects" class="mt-8 mb-0" outlined>
            No projects found.
          </v-alert>
        </template>

        <template v-slot:no-data>
          <v-alert type="error" title="No Projects" class="mt-8 mb-0" outlined>
            No projects found.
          </v-alert>
        </template>

        <template v-slot:default="props">
          <v-row class="mt-4">
            <v-col cols="12" v-for="project in props.items" :key="project.id">
              <v-sheet elevation="2">
                <v-container fluid>
                  <v-row class="align-center">
                    <v-col cols="12" lg="10">
                      <div class="text-truncate title">
                        <router-link :to="`/projects/${ project.id }`">{{ project.name }}</router-link>
                      </div>
                      <div class="caption">
                        Last Updated: {{ project.updatedAt | moment("MMM d, YYYY h:mm a") }} ({{ project.updatedAt | moment('from') }})
                        <v-chip color="info" small v-if="project.userOwner" class="ml-2">
                          <v-icon small left>mdi-account</v-icon>
                          <strong>My Project</strong>
                        </v-chip>
                        <v-chip color="warning" small v-if="!project.publish" class="ml-2">
                          <v-icon small left>mdi-information-outline</v-icon>
                          <strong>Unpublished</strong>
                        </v-chip>
                      </div>
                      <div class="body-2 black--text mt-4">{{ project.description }}</div>
                    </v-col>
                    <v-col cols="12" lg="2">
                      <div>
                        <v-btn color="primary" class="px-2" :to="`/projects/${ project.id }`">
                          Load Project <v-icon >mdi-chevron-right</v-icon>
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>
                </v-container>
              </v-sheet>
            </v-col>
          </v-row>
        </template>

        <!-- <template v-slot:footer>
          <v-container fluid>
            <v-row
              class="mt-8 pl-2 pr-4"
              align="center"
              justify="center"
            >
              <div>
                # Projects: {{ filteredItems.length }} of {{ projects.length }}
              </div>
              <v-divider vertical class="mx-4"></v-divider>
              <span class="">Projects per page</span>
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    text
                    class="ml-2"
                    v-bind="attrs"
                    v-on="on"
                  >
                    {{ itemsPerPage }}
                    <v-icon>mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-for="(number, index) in itemsPerPageArray"
                    :key="index"
                    @click="updateItemsPerPage(number)"
                  >
                    <v-list-item-title>{{ number }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-spacer></v-spacer>

              <span
                class="mr-4 mt-1"
              >
                Page {{ page }} of {{ numberOfPages }}
              </span>
              <v-btn
                icon
                class="mr-1"
                @click="formerPage"
              >
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <v-btn
                icon
                class="ml-1"
                @click="nextPage"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </v-row>
          </v-container>
        </template> -->
      </v-data-iterator>
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
  name: 'Projects',
  data () {
    return {
      status: 'loading',
      projects: [],
      userProjectsOnly: false,
      itemsPerPage: Infinity,
      itemsPerPageArray: [5, 10, 25, 50, Infinity],
      page: 1,
      numberOfPages: 1,
      search: '',
      sortBy: 'updated',
      sortDesc: true,
      filteredItems: [],
      keys: [
        {
          key: 'name',
          label: 'Project Title'
        },
        {
          key: 'updated',
          label: 'Last Updated'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['user']),
    displayProjects () {
      if (this.userProjectsOnly) {
        return this.projects.filter(d => d.userOwner)
      } else {
        return this.projects
      }
    }
  },
  mounted () {
    Promise.all([this.fetchPublishedProjects(), this.fetchUserProjects()])
      .then(([publishedProjects, userProjects]) => {
        const projects = [...publishedProjects, ...userProjects]
        projects.forEach(d => {
          d.updated = d.updatedAt
          d.userOwner = this.user && this.user.username === d.userId
        })
        this.filteredItems = projects
        this.numberOfPages = Math.ceil(projects.length / this.itemsPerPage)
        this.projects = projects
        this.status = 'ready'
      })
      .catch((err) => {
        console.error(err)
        this.status = 'error'
      })
  },
  methods: {
    fetchPublishedProjects () {
      return this.$http.get('/projects')
        .then(response => response.data.filter(d => d.publish))
    },
    fetchUserProjects () {
      if (!this.user) return Promise.resolve([])

      return this.$Amplify.Auth.currentSession()
        .then(session => session.getIdToken().getJwtToken())
        .then(token => {
          return this.$http.get('/user-projects', {
            headers: { Authorization: token }
          })
        })
        .then(response => response.data.filter(d => !d.publish))
    },
    nextPage () {
      window.dataIterator = this.$refs.dataIterator
      if (this.page + 1 <= this.numberOfPages) this.page += 1
    },
    formerPage () {
      if (this.page - 1 >= 1) this.page -= 1
    },
    updateItemsPerPage (number) {
      this.itemsPerPage = number
    },
    currentItems () {
      if (!this.$refs.dataIterator) return
      this.filteredItems = this.$refs.dataIterator.$children[0].filteredItems
      this.numberOfPages = Math.ceil(this.filteredItems.length / this.itemsPerPage)
    }
  }
}
</script>
