<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-0">
      <span class="title" v-if="isNew">Create New Project</span>
      <span class="title" v-else>Edit Project</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-stepper v-model="step" vertical class="mt-0 mb-4" style="border-radius:0">
      <v-stepper-step :complete="file.status === 'SUCCESS'" step="1">Load dataset file</v-stepper-step>
      <v-stepper-content step="1">
        <v-card>
          <v-card-text class="py-0">
            <p>
              The dataset file must be in comma-separated values (CSV) format and contain at least four columns for the tag/individual ID, date/time, latitude, and longitude.
            </p>
            <v-file-input
              ref="fileInput"
              v-model="file.input"
              label="Select the dataset file"
              outlined
              class="mt-8"
              prepend-inner-icon="$file"
              prepend-icon=""
              @change="loadLocalFile">
            </v-file-input>
            <div v-if="file.status === 'SUCCESS'">
              <v-alert type="success" outlined :value="!!file.value.local">
                <strong>Local file ({{file.value.name}}) has been successfully loaded.</strong>
              </v-alert>
              <v-alert type="info" outlined :value="!file.value.local">
                <strong>Remote file ({{file.value.name}}) has been successfully loaded from the TAME server.</strong><br><br>
                To update the dataset, select a new file from your local computer.
              </v-alert>
              <div class="subtitle-1 font-weight-bold">
                Current File
              </div>
              <div class="ml-4 mb-4">
                Filename: <strong>{{ file.value.name }}</strong><br>
                # Rows: <strong>{{ file.value.parsed.data.length.toLocaleString() }}</strong><br>
                Columns: <strong>{{ file.value.parsed.meta.fields.join(', ') }}</strong>
              </div>
            </div>
            <v-alert type="error" outlined :value="file.status === 'ERROR'">
              <span v-html="file.error"></span>
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="nextFile" class="ml-2" :disabled="file.status !== 'SUCCESS'">continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step :complete="columns.status === 'SUCCESS'" step="2">Define primary variables</v-stepper-step>
      <v-stepper-content step="2">
        <v-card>
          <v-card-text class="py-0" v-if="file.value">
            <p>
              Select the column names for the primary variables (ID, datetime, latitude, longitude).
            </p>

            <v-row>
              <v-col>
                <v-select
                  :items="file.value.parsed.meta.fields"
                  v-model="columns.value.id"
                  label="Select individual (tag) ID column"
                  outlined
                  required
                  :error-messages="columnsIdErrors">
                </v-select>
              </v-col>
              <v-col>
                <v-select
                  :items="file.value.parsed.meta.fields"
                  v-model="columns.value.datetime"
                  label="Select date/time column"
                  outlined
                  required
                  hint="Timestamps must be in ISO format (e.g., YYYY-MM-DD HH:mm)."
                  persistent-hint
                  :error-messages="columnsDatetimeErrors">
                </v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  :items="file.value.parsed.meta.fields"
                  v-model="columns.value.latitude"
                  label="Select latitude variable"
                  outlined
                  required
                  hint="Latitude must be in decimal degrees."
                  persistent-hint
                  :error-messages="columnsLatitudeErrors">
                </v-select>
              </v-col>
              <v-col>
                <v-select
                  :items="file.value.parsed.meta.fields"
                  v-model="columns.value.longitude"
                  label="Select longitude variable"
                  outlined
                  required
                  hint="Longitude must be in decimal degrees. Values should be negative for U.S.A."
                  persistent-hint
                  :error-messages="columnsLongitudeErrors">
                </v-select>
              </v-col>
            </v-row>
            <v-alert type="error" outlined :value="columns.status === 'ERROR' && !!columns.error">
              <span v-html="columns.error"></span>
            </v-alert>
          </v-card-text>
          <v-card-text v-else>
            <v-alert type="error" outlined>
              <strong>File not found</strong><br><br>
              Please return to previous step.
            </v-alert>
          </v-card-text>
          <!-- <v-card-text>
            <pre>
              status: {{ columns.status }}
              error: {{ columns.error || 'none' }}
              $invalid: {{ $v.columns.value.$invalid }}
              $dirty: {{ $v.columns.value.$dirty }}
              values: {{ columns.value }}
            </pre>
          </v-card-text> -->
          <v-card-actions>
            <v-btn color="default" @click="prevColumns" class="mx-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
            <v-btn color="primary" @click="nextColumns" class="mx-4 pl-4">continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step :complete="variables.status === 'SUCCESS'" step="3">Define additional variables</v-stepper-step>
      <v-stepper-content step="3">
        <v-card>
          <v-card-text class="py-0" v-if="variables.value.length > 0">
            <p>
              Add additional variables to the dataset from the remaining columns.
            </p>
            <p>
              For each additional variable, please provide a descriptive label (default is to use the column name),
              select the variable type (continuous or discrete), and specify the types of how this variable can be used in the application
              (e.g. as a crossfilter or for assigning colors to the observed locations on the map).
            </p>
            <v-row>
              <v-col md="4" class="mr-2">
                <div>Column Names</div>
                <v-list>
                  <v-list-item-group v-model="variableIndex" color="primary">
                    <v-list-item v-for="variable in variables.value" :key="'variable-' + variable.id">
                      <v-list-item-content>
                        <v-list-item-title>
                          <v-icon left v-if="variable.skip" color="default">mdi-checkbox-blank-circle-outline</v-icon>
                          <v-icon left v-else-if="variable.valid" color="success">mdi-check-circle-outline</v-icon>
                          <v-icon left v-else color="error">mdi-close-circle-outline</v-icon>
                          {{variable.id}}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-col>
              <v-divider vertical></v-divider>
              <v-col md="7" class="ml-2" v-if="variable.value">
                <v-text-field
                  v-model="variable.value.name"
                  name="variableName"
                  label="Variable label"
                  counter
                  required
                  outlined
                  :error-messages="variableNameErrors"
                  @input="$v.variable.value.name.$touch()"
                  @blur="$v.variable.value.name.$touch()"
                ></v-text-field>
                <v-select
                  :items="variableTypeOptions"
                  item-value="value"
                  item-text="label"
                  v-model="variable.value.type"
                  label="Type of variable"
                  outlined
                  required
                  :error-messages="variableTypeErrors"
                  @input="$v.variable.value.type.$touch()"
                  @blur="$v.variable.value.type.$touch()"
                ></v-select>
                <div>Include this variable in the following options:</div>
                <v-row>
                  <v-col class="pt-0">
                    <v-checkbox hide-details label="Crossfilter" v-model="variable.value.filter"></v-checkbox>
                    <v-checkbox hide-details label="Color" v-model="variable.value.color"></v-checkbox>
                  </v-col>
                  <v-col class="pt-0">
                    <v-checkbox hide-details label="Size" :disabled="variable.value.type === 'discrete'" v-model="variable.value.size"></v-checkbox>
                    <v-checkbox hide-details label="Outline" :disabled="variable.value.type === 'continuous'" v-model="variable.value.outline"></v-checkbox>
                  </v-col>
                </v-row>
                <v-alert type="error" :value="variable.status == 'ERROR' && !!variable.error" class="mt-4" outlined>
                  <span v-html="variable.error"></span>
                </v-alert>
                <v-card-actions class="px-0 mt-4">
                  <v-btn color="success" @click="addVariable()"><v-icon left>mdi-plus-circle-outline</v-icon> Add Variable</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn color="default" @click="skipVariable()"><v-icon left>mdi-minus-circle-outline</v-icon>Exclude Variable</v-btn>
                </v-card-actions>
              </v-col>
              <v-col md="7" class="ml-2" v-else>
                <v-alert type="info" prominent outlined icon="mdi-chevron-left">
                  Select a column from the list
                </v-alert>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text v-else>
            <p>Dataset does not contain any additional variables, please continue.</p>
          </v-card-text>
          <v-alert type="error" :value="variables.status === 'ERROR' && variables.error" class="mt-8" outlined>
            <span v-html="variables.error"></span>
          </v-alert>
          <v-card-actions class="mt-4">
            <v-btn color="default" @click="prevVariables" class="mx-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
            <v-btn color="primary" @click="nextVariables" class="mx-4 pl-4">Continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step :complete="finish.status === 'SUCCESS'" step="4">Finish</v-stepper-step>
      <v-stepper-content step="4">
        <v-card>
          <v-card-text v-if="!(project && project.id)">
            <v-alert type="success" outlined>
              <strong>All done!</strong><br><br>
              You can change any of these options or load a new version of the dataset by clicking the <strong>Edit Project</strong> button.<br><br>
              You can also <strong>Publish</strong> your project to save it to the TAME server and make it available to other users.
            </v-alert>
          </v-card-text>
          <v-card-text v-else>
            <v-alert type="success" outlined>
              <strong>All done!</strong><br><br>
              Please click the Finish button to apply these changes.
            </v-alert>
            <v-alert type="warning" outlined>
              <strong>Changes will NOT automatically be saved to server.</strong><br><br>
              To save these changes to the TAME server and make them available to other users, you must re-publish the project to the server by clicking the <strong>Publish</strong> button.
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-btn color="default" @click="step -= 1" class="mx-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
            <v-btn color="primary" @click="submit" :loading="finish.status === 'PENDING'" class="mx-4 pl-4">Finish <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>
    </v-stepper>

    <v-card-actions class="mx-4 pb-4">
      <v-spacer></v-spacer>
      <v-btn to="/">cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { helpers, required, minLength, maxLength } from 'vuelidate/lib/validators'
import { mapGetters, mapActions } from 'vuex'
import Joi from '@hapi/joi'
import * as d3 from 'd3'

import parse from '@/lib/parse'

const alphaNum = helpers.regex('alphaNum', /^[a-zA-Z0-9\-_. \\(\\)]*$/)

export default {
  name: 'ProjectForm',
  mixins: [validationMixin],
  validations: {
    columns: {
      value: {
        id: { required },
        datetime: { required },
        latitude: { required },
        longitude: { required }
      }
    },
    variable: {
      value: {
        name: { required, alphaNum, minLength: minLength(2), maxLength: maxLength(25) },
        type: { required }
      }
    }
  },
  data () {
    return {
      isNew: true,
      step: 1,
      variableIndex: 0,
      variableTypeOptions: [
        {
          value: 'continuous',
          label: 'Continuous (Numeric)'
        },
        {
          value: 'discrete',
          label: 'Discrete (Categorical)'
        }
      ],
      file: {
        status: 'READY',
        error: null,
        input: null,
        local: null,
        value: null
      },
      columns: {
        status: 'READY',
        error: null,
        value: {
          id: null,
          datetime: null,
          latitude: null,
          longitude: null
        }
      },
      variables: {
        status: 'READY',
        error: null,
        value: []
      },
      variable: {
        status: 'READY',
        error: null,
        value: null
      },
      finish: {
        status: 'READY',
        error: null
      }
    }
  },
  computed: {
    ...mapGetters(['project', 'user']),
    columnsIdErrors () {
      const errors = []
      if (this.columns.status === 'READY') return errors
      !this.$v.columns.value.id.required && errors.push('ID column is required.')
      return errors
    },
    columnsDatetimeErrors () {
      const errors = []
      if (this.columns.status === 'READY') return errors
      !this.$v.columns.value.datetime.required && errors.push('Datetime column is required.')
      return errors
    },
    columnsLatitudeErrors () {
      const errors = []
      if (this.columns.status === 'READY') return errors
      !this.$v.columns.value.latitude.required && errors.push('Latitude column is required.')
      return errors
    },
    columnsLongitudeErrors () {
      const errors = []
      if (this.columns.status === 'READY') return errors
      !this.$v.columns.value.longitude.required && errors.push('Longitude column is required.')
      return errors
    },
    variableNameErrors () {
      const errors = []
      if (this.variable.status === 'READY') return errors
      !this.$v.variable.value.name.required && errors.push('Name is required.')
      !this.$v.variable.value.name.alphaNum && errors.push('Name can only contain letters, numbers, spaces, or basic punctuation.')
      !this.$v.variable.value.name.minLength && errors.push('Name must be at least 2 characters.')
      !this.$v.variable.value.name.maxLength && errors.push('Name cannot be more than 25 characters.')
      return errors
    },
    variableTypeErrors () {
      const errors = []
      if (this.variable.status === 'READY') return errors
      !this.$v.variable.value.type.required && errors.push('Type must be assigned.')
      return errors
    }
  },
  watch: {
    variableIndex (newIndex, oldIndex) {
      this.selectVariable(newIndex)
    }
  },
  created () {
    this.isNew = this.$route.meta.isNew

    if (!this.isNew) {
      this.file.value = JSON.parse(JSON.stringify(this.project.file))
      this.file.status = 'SUCCESS'
      this.columns.value = JSON.parse(JSON.stringify(this.project.columns))
      this.variables.value = JSON.parse(JSON.stringify(this.project.variables))
    }
  },
  methods: {
    ...mapActions(['loadProject']),
    submit () {
      this.finish.status = 'PENDING'
      const project = {
        name: this.file.value.name,
        columns: this.columns.value,
        variables: this.variables.value.filter(d => !d.skip),
        file: this.file.value
      }

      if (this.project && this.project.id) {
        project.id = this.project.id
        project.name = this.project.name
        project.description = this.project.description
        project.createdAt = this.project.createdAt
        project.updatedAt = this.project.updatedAt
        project.userId = this.project.userId
      }

      return this.loadProject(project)
        .then((project) => {
          this.finish.status = 'SUCCESS'
          this.$router.push({ name: 'home' })
        })
    },
    setError (step, e) {
      this[step].status = 'ERROR'
      this[step].error = e ? (e.message || e) : null
    },
    loadLocalFile () {
      if (!this.file.input) return

      this.file.value = null
      this.file.status = 'PENDING'

      const localFile = this.file.input
      const filename = localFile.name
      const fileExtension = filename.split('.').pop().toLowerCase()

      if (fileExtension !== 'csv') {
        this.file.input = null
        this.$refs.fileInput.blur()

        return this.setError('file', `
          <strong>Failed to load file (${localFile.name})</strong><br><br>
          File must be a comma-separated value (CSV) file with extension '.csv'.
        `)
      }

      parse(localFile)
        .then((results) => {
          this.file.input = null
          this.$refs.fileInput.blur()
          if (results.errors.length > 0) {
            return this.setError('file', `
              <strong>Failed to load file (${localFile.name})</strong><br><br>
              ${results.errors[0].message} (Row ${results.errors[0].row})
            `)
          }
          if (!results.meta.fields.every(d => d.length > 0)) {
            const index = results.meta.fields.findIndex(d => d.length === 0) + 1
            return this.setError('file', `
              <strong>Failed to load file (${localFile.name})</strong><br><br>
              File contains an unnamed column (column ${index}). Please remove this column or add a name for it in the header row.
            `)
          }

          this.file.value = {
            name: localFile.name,
            size: localFile.size,
            parsed: results,
            local: localFile
          }
          this.file.status = 'SUCCESS'
          this.resetColumns()
        })
        .catch((e) => {
          this.setError('file', e)
        })
    },
    nextFile () {
      if (this.file.status === 'SUCCESS') {
        this.step += 1
      }
    },
    prevStep () {
      this.step -= 1
    },
    resetColumns () {
      this.columns.status = 'READY'
      this.columns.error = null

      if (!this.file.value) {
        this.columns.value.id = null
        this.columns.value.datetime = null
        this.columns.value.latitude = null
        this.columns.value.longitude = null
      } else {
        const fields = this.file.value.parsed.meta.fields
        if (!fields.includes(this.columns.value.id)) {
          this.columns.value.id = null
        }
        if (!fields.includes(this.columns.value.datetime)) {
          this.columns.value.datetime = null
        }
        if (!fields.includes(this.columns.value.latitude)) {
          this.columns.value.latitude = null
        }
        if (!fields.includes(this.columns.value.longitude)) {
          this.columns.value.longitude = null
        }
      }
    },
    prevColumns () {
      if (this.columns.status !== 'SUCCESS') {
        this.columns.status = 'READY'
        this.columns.error = null
      }
      this.step -= 1
    },
    nextColumns () {
      this.$v.columns.value.$touch()
      if (this.$v.columns.value.$invalid) {
        this.setError('columns')
        return
      }

      this.columns.status = 'PENDING'

      this.validateColumns()
        .then((result) => {
          this.columns.status = 'SUCCESS'
          this.step += 1
          this.resetVariables()
        })
        .catch((e) => {
          this.setError('columns', `<strong>Failed to validate primary columns</strong><br><br>${e.message || e}`)
        })
    },
    validateColumns () {
      if (!this.file.value.parsed) {
        this.setError('columns', '<strong>File not found</strong><br><br>Please return to the first step and load a new file.')
      }
      const c = this.columns.value
      const rowSchema = Joi.object({
        [c.id]: Joi.string().required(),
        [c.datetime]: Joi.date().iso().required(),
        [c.latitude]: Joi.number().required().min(-90).max(90),
        [c.longitude]: Joi.number().required().min(-180).max(180)
      })
      const schema = Joi.array().items(rowSchema).required()
      const data = this.file.value.parsed.data.map(d => ({
        [c.id]: d[c.id],
        [c.datetime]: d[c.datetime],
        [c.latitude]: +d[c.latitude],
        [c.longitude]: +d[c.longitude]
      }))
      return new Promise((resolve, reject) => {
        const { error, value } = schema.validate(data)
        if (error) {
          return reject(error)
        }
        resolve(value)
      })
    },
    resetVariables () {
      this.variables.status = 'READY'
      this.variables.error = null
      this.variable.status = 'READY'
      this.variable.error = null

      const fields = this.file.value.parsed.meta.fields
        .filter(d => !Object.values(this.columns.value).includes(d))

      if (fields.length === 0) {
        this.variables.value = []
        this.variables.status = 'SUCCESS'
        return
      }

      const newValue = fields.map(key => {
        // existing variable
        const index = this.variables.value.findIndex(d => d.id === key)
        if (index >= 0) {
          return this.variables.value[index]
        }

        // new variable
        const variable = {
          id: key,
          name: key,
          type: null,
          domain: null,
          filter: true,
          color: true,
          size: false,
          outline: false,
          valid: false,
          skip: true
        }

        const value = this.file.value.parsed.data[0][variable.id]
        if (isNaN(+value)) {
          variable.type = 'discrete'
        } else {
          variable.type = 'continuous'
        }
        if (variable.type === 'continuous') {
          variable.size = true
        }

        return variable
      })

      this.variables.value = newValue
      this.selectVariable(0)
      this.variables.status = 'READY'
    },
    prevVariables () {
      if (this.variables.status !== 'SUCCESS') {
        this.variables.status = 'READY'
        this.variables.error = null
      }
      this.step -= 1
    },
    nextVariables () {
      if (!this.variables.value.filter(d => !d.skip).every(d => d.valid)) {
        return this.setError('variables', 'One or more variables have not been validated. Go through the list of variables, and click the Validate button.')
      }
      this.variables.status = 'SUCCESS'
      this.step += 1
    },
    selectVariable (index) {
      if (this.variableIndex !== index) {
        this.variableIndex = index
      }

      this.$v.variable.value.$reset()
      this.variable.status = 'READY'
      this.variable.error = null

      if (isNaN(index)) {
        this.variable.value = null
        return
      }

      this.variable.value = Object.assign({}, this.variables.value[this.variableIndex])
    },
    validateVariable () {
      this.$v.variable.value.$touch()
      if (this.$v.variable.value.$invalid) {
        this.variable.status = 'ERROR'
        return false
      }

      if (this.variable.value.type === 'discrete') {
        this.variable.value.domain = [...new Set(this.file.value.parsed.data.map(d => d[this.variable.value.id]))].sort(d3.ascending)
        if (this.variable.value.outline && this.variable.value.domain.length !== 2) {
          this.setError('variable', `
            <strong>Variable cannot be an Outline option</strong><br><br>
            A variable can only be an Outline option if it has exactly 2 unique values (found ${this.variable.value.domain.length}).
            Unselect the Outline option and try again, or modify the dataset file and return to the beginning.
          `)
          return false
        }
        this.variable.value.size = false
      } else if (this.variable.value.type === 'continuous') {
        this.variable.value.domain = d3.extent(this.file.value.parsed.data, d => +d[this.variable.value.id])
        this.variable.value.outline = false
      }
      return true
    },
    nextVariable () {
      if (this.variables.value.filter(d => !d.skip).every(d => d.valid)) {
        this.variables.status = 'SUCCESS'
      }

      if (this.variableIndex < this.variables.value.length - 1) {
        this.selectVariable(this.variableIndex + 1)
      } else {
        this.selectVariable(0)
      }
    },
    skipVariable () {
      this.variable.value.skip = true
      this.variables.value[this.variableIndex] = this.variable.value
      this.nextVariable()
    },
    addVariable () {
      if (!this.validateVariable()) {
        this.variable.value.valid = false
        return
      }

      this.variable.value.skip = false
      this.variable.value.valid = true
      this.variables.value[this.variableIndex] = this.variable.value

      this.nextVariable()
    }
  }
}
</script>
