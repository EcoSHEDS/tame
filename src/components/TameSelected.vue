<template>
  <div>
    <div>
      <strong>Tag ID:</strong> <span class="black--text ml-2">{{ id }}</span>
    </div>
    <div>
      <strong># Observations:</strong> <span class="black--text ml-2">{{ values.length }}</span>
    </div>
    <v-dialog
      v-model="dialog"
      scrollable
      max-width="800">
      <template v-slot:activator="{ on }">
        <v-btn
          block
          color="grey darken-1"
          dark
          class="pb-0 mb-0"
          v-on="on">
          <v-icon left>mdi-table</v-icon> View Data
        </v-btn>
      </template>

      <v-card>
        <v-toolbar dense color="grey lighten-2">
          <strong>Selected Individual</strong>
          <v-spacer></v-spacer>
          <v-btn height="24" width="24" icon @click="dialog = false" class="grey darken-1 elevation-2 mr-0" dark>
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <h4 class="my-4">
            Tag ID: <span class="black--text font-weight-regular">{{ id }}</span>
            <span class="mx-4">|</span>
            # Observations: <span class="black--text font-weight-regular">{{ values.length }}</span>
          </h4>
          <v-divider></v-divider>
          <v-simple-table v-if="values.length > 0" :height="$vuetify.breakpoint.height - 250" fixed-header>
            <thead>
              <tr>
                <th class="text-left">Date/Time</th>
                <th class="text-left">Latitude</th>
                <th class="text-left">Longitude</th>
                <th class="text-left">Cohort</th>
                <th class="text-left">Length</th>
                <th class="text-left">Active</th>
                <th class="text-left">Season</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in values" :key="row.$index">
                <td>{{ row.datetime | moment('MM/DD/YYYY hh:mm a') }}</td>
                <td>{{ row.lat.toFixed(4) }}</td>
                <td>{{ row.lon.toFixed(4) }}</td>
                <td>{{ row.cohort }}</td>
                <td>{{ row.length.toFixed(1) }}</td>
                <td>{{ row.active }}</td>
                <td>{{ row.season }}</td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { xf } from '@/crossfilter'
import { mapGetters } from 'vuex'
export default {
  name: 'TameSelected',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      dialog: false
    }
  },
  computed: {
    ...mapGetters(['project']),
    values () {
      return xf.all().filter(d => d[this.project.columns.id] === this.id)
    }
  }
}
</script>
