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
          <!-- <v-row>
            <v-col
              v-for="item in props.items"
              :key="item.name"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card>
                <v-card-title class="subheading font-weight-bold">
                  {{ item.name }}
                </v-card-title>

                <v-divider></v-divider>

                <v-list dense>
                  <v-list-item
                    v-for="(key, index) in filteredKeys"
                    :key="index"
                  >
                    <v-list-item-content :class="{ 'blue--text': sortBy === key }">
                      {{ key }}:
                    </v-list-item-content>
                    <v-list-item-content
                      class="align-end"
                      :class="{ 'blue--text': sortBy === key }"
                    >
                      {{ item[key.toLowerCase()] }}
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row> -->
        </template>
        <template v-slot:footer>
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
                class="mr-4"
              >
                Page {{ page }} of {{ numberOfPages }}
              </span>
              <v-btn
                fab
                color="grey lighten-2"
                class="mr-1"
                x-small
                @click="formerPage"
              >
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <v-btn
                fab
                color="grey lighten-2"
                class="ml-1"
                x-small
                @click="nextPage"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </v-row>
          </v-container>
        </template>
      </v-data-iterator>
    </v-card-text>
    <!-- <v-card-text v-else-if="status === 'ready'" class="py-4 px-6 black--text">
      <div v-if="user">
        <div class="title">My Projects</div>
        <div class="caption">Only you can see this list. If any of your projects are published, they will also appear in the Published Projects list below.</div>
        <v-row v-if="userProjects.length > 0">
          <v-col cols="12" md="6" lg="4" xl="4" v-for="project in userProjects" :key="project.id">
            <v-card class="fill-height d-flex flex-column">
              <v-card-title primary-title class="pb-0">
                <span class="text-truncate title">{{ project.name }}</span>
              </v-card-title>
              <v-card-text class="caption pb-0">
                Updated: {{ project.updatedAt | moment('from') }} |
                <span v-if="project.publish">
                  Published
                </span>
                <span class="red--text" v-else>
                  Not Published
                </span>
              </v-card-text>
              <v-card-text class="flex pt-4 pb-0">
                <p class="body-2 grey--text text--darken-3">{{ project.description }}</p>
              </v-card-text>
              <v-card-actions class="pa-4">
                <v-btn color="primary" class="px-2" :to="`/projects/${ project.id }`">Load Project <v-icon >mdi-chevron-right</v-icon></v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <v-alert type="error" outlined prominent color="primary" v-else class="mt-4">
          <div class="title">You do not have any projects!</div>
          <router-link :to="{ name: 'newProject' }">Create a new one?</router-link>
        </v-alert>
        <v-divider class="my-8"></v-divider>
      </div>
      <div>
        <v-row class="my-4">
          <v-col cols="8">
            <v-text-field label="Search" outlined hide-details prepend-icon="mdi-magnify"></v-text-field>
          </v-col>
          <v-col cols="4" class="">
            <div >
              <v-checkbox label="Only My Projects" hide-details></v-checkbox>
            </div>
          </v-col>
        </v-row>
        <v-row v-if="publishedProjects.length > 0" class="mt-8">
          <v-col cols="12" v-for="project in publishedProjects" :key="project.id">
            <v-card>
              <v-card-text>
                <v-row class="align-center">
                  <v-col cols="10">
                    <div class="text-truncate title black--text">
                      <router-link :to="`/projects/${ project.id }`">{{ project.name }}</router-link>
                    </div>
                    <div class="caption">Updated: {{ project.updatedAt | moment('from') }}</div>
                    <div class="body-2 black--text">{{ project.description }}</div>
                  </v-col>
                  <v-col cols="2">
                    <div>
                      <v-btn color="primary" class="px-2" :to="`/projects/${ project.id }`">
                        Load Project <v-icon >mdi-chevron-right</v-icon>
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-alert type="error" outlined prominent color="primary" v-else class="mt-4">
          <div class="title">No projects have been published yet!</div>
          <router-link :to="{ name: 'newProject' }">Create a new one?</router-link>
        </v-alert>
      </div>
    </v-card-text> -->
    <v-divider></v-divider>
    <v-card-actions class="mx-4">
      <v-spacer></v-spacer>
      <v-btn to="/" text>close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
// import * as d3 from 'd3'
import { mapGetters } from 'vuex'

export default {
  name: 'Projects',
  data () {
    return {
      status: 'loading',
      projects: [],
      userProjectsOnly: false,
      itemsPerPage: 5,
      itemsPerPageArray: [5, 10, 25, 50],
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
    // numberOfPages () {
    //   // return Math.ceil(this.publishedProjects.length / this.itemsPerPage)
    //   if (!this.$refs.dataIterator) return 0
    //   return Math.ceil(this.$refs.dataIterator.internalCurrentItems.length / this.itemsPerPage)
    // }
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
