<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-0">
      <span class="title" v-if="isNew">Create a New Project</span>
      <span class="title" v-else>Edit Project</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-stepper v-model="step" vertical class="elevation-0 pb-4">
      <v-stepper-step :complete="file.status === 'SUCCESS'" step="1">Load dataset file ({{file.status}})</v-stepper-step>
      <v-stepper-content step="1">
        <v-card>
          <v-card-text class="py-0 body-2">
            <div class="subtitle-1 font-weight-medium">Instructions</div>
            <p>
              TAME is designed to visualize the movement of tagged individuals over space and time.
            </p>
            <p>
              The dataset can be provided as a simple table where each row corresponds to the observed location of one individual
              at a specific point in time, and each column corresponds to a variable specifying some attribute
              about that observation or individual.
            </p>
            <p>
              The dataset must be provided in comma-separated values (CSV) format
              (see <a href="https://support.office.com/en-us/article/import-or-export-text-txt-or-csv-files-5250ac4c-663c-47ce-937b-339e391393ba" target="_blank">How to Export to a CSV File from Excel</a>).
              and contain these four columns (note that columns names can vary):
            </p>
            <ul class="mb-4">
              <li>
                <span class="font-weight-medium">Individual Tag ID</span>: unique IDs assigned to each individual.
              </li>
              <li>
                <span class="font-weight-medium">Timestamp</span>: date and time when the individual was observed. Both the date and
                time must be combined in a single column and use ISO format (YYYY-MM-DD HH:mm) (see
                <a href="https://www.myonlinetraininghub.com/excel-date-and-time-formatting" target="_blank">Excel Date and Time Formatting</a>,
                use a custom format type of "yyyy-mm-dd hh:mm" before exporting to a CSV). Time portion may be omitted if the timeseries uses
                daily time steps.
              </li>
              <li>
                <span class="font-weight-medium">Latitude</span>: latitude in decimal degrees (e.g., 42.43294).
              </li>
              <li>
                <span class="font-weight-medium">Longitude</span>: longitude in decimal degrees (e.g., -72.59322). Values must be negative when west of the central Meridian (e.g. U.S.A.).
              </li>
            </ul>
            <p>
              In addition to these four columns, the dataset may contain any number of additional variables (e.g. sex, length, cohort)
              that can be used for assigning the color/size/outline of each observation point and/or for filtering the dataset.
            </p>

            <v-file-input
              ref="fileInput"
              v-model="file.input"
              label="Select the dataset file"
              outlined
              class="mb-4 mt-8"
              prepend-inner-icon="$file"
              prepend-icon
              hide-details
              @change="loadLocalFile">
            </v-file-input>
            <div v-if="file.status === 'SUCCESS'">
              <v-alert type="success" dense outlined :value="!!file.value">
                <div class="font-weight-bold" v-if="!!file.value.local">
                  File Successfully Loaded from Your Computer
                </div>
                <div class="font-weight-bold" v-else-if="!file.value.local">
                  File Successfully Loaded from the Server
                </div>
                <div class="mt-4 font-family-mono">
                  Filename: <strong>{{ file.value.name }}</strong><br>
                  &nbsp;&nbsp;# Rows: <strong>{{ file.parsed.data.length.toLocaleString() }}</strong><br>
                  &nbsp;Columns: <strong>{{ file.parsed.meta.fields.join(', ') }}</strong>
                </div>
              </v-alert>
              <v-alert type="info" dense outlined :value="!!file.value && !file.value.local">
                <div class="font-weight-bold">
                  To update the dataset, use the input box above to load a new file from your computer, and then proceed
                  through the remaining steps.
                </div>
              </v-alert>
              <v-alert type="warning" dense outlined :value="file.parsed.data.length >= 10000">
                <div class="font-weight-bold">Large File Detected</div>
                Files with more than 10,000 rows may cause the application to run more slowly depending on the speed of your computer.
                For optimal performance, reduce the file size by including fewer individuals, limiting the overall time period, or aggregating
                time steps (e.g. hourly to daily timesteps).
              </v-alert>
            </div>
            <v-alert type="error" outlined :value="file.status === 'ERROR'">
              <span v-html="file.error"></span>
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="nextFile" class="ml-2 pl-4" :disabled="file.status !== 'SUCCESS'">continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step :rules="[() => columns.status !== 'ERROR']" :complete="columns.status === 'SUCCESS'" step="2">Select primary variables ({{columns.status}})</v-stepper-step>
      <v-stepper-content step="2">
        <v-card>
          <v-card-text class="py-0" v-if="file.value">
            <div class="subtitle-1 font-weight-medium">Instructions</div>
            <p>
              Select the column name for each of the four primary variables.
            </p>

            <v-row class="mt-8">
              <v-col>
                <v-select
                  :items="file.parsed.meta.fields"
                  v-model="columns.value.id"
                  label="Select individual/tag ID column"
                  outlined
                  required
                  hint="Defines which observations are associated with each individual."
                  persistent-hint
                  :error-messages="columnsIdErrors"
                  @change="validateColumns">
                </v-select>
              </v-col>
              <v-col>
                <v-select
                  :items="file.parsed.meta.fields"
                  v-model="columns.value.datetime"
                  label="Select timestamp column"
                  outlined
                  required
                  hint="Timestamps must be in ISO format (e.g., YYYY-MM-DD HH:mm)."
                  persistent-hint
                  :error-messages="columnsDatetimeErrors"
                  @change="validateColumns">
                </v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  :items="file.parsed.meta.fields"
                  v-model="columns.value.latitude"
                  label="Select latitude column"
                  outlined
                  required
                  hint="Latitude must be in decimal degrees."
                  persistent-hint
                  :error-messages="columnsLatitudeErrors"
                  @change="validateColumns">
                </v-select>
              </v-col>
              <v-col>
                <v-select
                  :items="file.parsed.meta.fields"
                  v-model="columns.value.longitude"
                  label="Select longitude column"
                  outlined
                  required
                  hint="Longitude must be in decimal degrees. Values should be negative for U.S.A."
                  persistent-hint
                  :error-messages="columnsLongitudeErrors"
                  @change="validateColumns">
                </v-select>
              </v-col>
            </v-row>
            <v-alert type="error" outlined :value="columns.status === 'ERROR' && !!columns.error">
              <span v-html="columns.error"></span>
            </v-alert>
          </v-card-text>
          <v-card-text v-else>
            <v-alert type="error" outlined>
              <div class="title">File Not Found</div>
              Please return to previous step to load a file.
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="default" @click="prevColumns" class="ml-2 mr-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
            <v-btn color="primary" @click="nextColumns" class="pl-4">continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step :complete="variables.status === 'SUCCESS'" step="3">Configure additional variables ({{variables.status}})</v-stepper-step>
      <v-stepper-content step="3">
        <v-card>
          <v-card-text class="py-0" v-if="variables.value.length > 0">
            <div class="subtitle-1 font-weight-medium">Instructions</div>
            <p>
              For each additional variable, provide a brief label,
              select the type (continuous or discrete), and specify which options can be used with this variable
              (e.g. for generating crossfilter histograms or for assigning colors to the observed locations).
            </p>
            <p>
              Initially, the form will include all additional variables in the dataset. However,
              you may exclude a specific variable by selecting it from the list and checking the "Exclude Variable" option.
            </p>
            <p>
              The form will use the column name as the default label, and make an educated guess about the type of each variable.
              Only continuous variables can be used for the Size option, and only discrete variables with two unique values
              can be used for the Outline option.
            </p>
            <v-row class="mt-8">
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
          <v-card-text v-else class="py-0">
            <v-alert type="info" outlined dense>
              <div class="font-weight-bold">Additional Variables Not Found</div>
              Dataset file does not contain any additional variables. Please continue to the final step.
            </v-alert>
          </v-card-text>
          <v-alert type="error" :value="variables.status === 'ERROR' && variables.error" class="mt-8" outlined>
            <span v-html="variables.error"></span>
          </v-alert>
          <v-card-actions class="mt-4">
            <v-btn text color="default" @click="prevVariables" class="ml-2 mr-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
            <v-btn color="primary" @click="nextVariables" class="pl-4">Continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step :complete="finish.status === 'SUCCESS'" step="4">Finish ({{finish.status}})</v-stepper-step>
      <v-stepper-content step="4">
        <v-card>
          <v-card-text v-if="!(project && project.id)">
            <v-alert type="success" outlined>
              <strong>All done!</strong><br><br>
              You can change any of these options or load a new version of the dataset by clicking the <strong>Edit Project</strong> button.<br><br>
              You can also <strong>Publish</strong> your project to save it to the TAME server and make it available to other users.
            </v-alert>
          </v-card-text>
          <v-card-text v-else class="pb-0">
            <v-alert type="success" outlined>
              <div class="font-weight-bold">All done!</div>
              Please click the Finish button to apply these changes.
            </v-alert>
            <v-alert type="warning" outlined>
              <div class="font-weight-bold">Changes will NOT be automatically saved to server</div>
              After clicking the Finish button and reviewing your changes in TAME, you must re-publish this project
              in order to save these changes to the server.
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="default" @click="step -= 1" class="ml-2 mr-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
            <v-btn color="primary" @click="submit" :loading="finish.status === 'PENDING'" class="mx-4 pl-4">Finish <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>
    </v-stepper>

    <v-divider></v-divider>

    <v-card-actions class="mx-4 py-4">
      <v-btn @click="submit" :loading="finish.status === 'PENDING'" color="primary" v-if="!isNew">Save Changes</v-btn>
      <v-spacer></v-spacer>
      <v-btn to="/" text>close</v-btn>
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

const alphaNum = helpers.regex('alphaNum', /^[a-zA-Z0-9\-_./ \\(\\)]*$/)

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
    ...mapGetters(['user', 'project']),
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
      !this.$v.variable.value.name.alphaNum && errors.push('Name can only contain letters, numbers, spaces, or basic punctuation ( \\-_./()).')
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
      if (!this.project) {
        // view was opened without a project loaded (e.g. direct url)
        this.isNew = true
        return this.$router.push({ name: 'newProject' })
      }
      const project = JSON.parse(JSON.stringify(this.project))
      if (this.project.file.local) {
        project.file.local = this.project.file.local
      }
      this.file.value = project.file
      this.file.parsed = project.dataset
      this.file.status = 'SUCCESS'
      this.columns.value = project.columns
      this.columns.status = 'SUCCESS'
      this.variables.value = project.variables
      this.variables.status = 'SUCCESS'
      this.finish.status = 'SUCCESS'
    } else {
      // clear currently loaded project when creating a new project
      this.loadProject()
    }
  },
  methods: {
    ...mapActions(['loadProject']),
    submit () {
      this.finish.status = 'PENDING'
      let project = {
        name: this.file.value.name,
        columns: this.columns.value,
        variables: this.variables.value.filter(d => !d.skip),
        file: this.file.value
      }

      if (this.project && this.project.id) {
        project = {
          ...this.project,
          ...project
        }
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
      return false
    },
    setReady (step) {
      this[step].status = 'READY'
      this[step].error = null
    },
    // Step 1: File
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
          <div class="font-weight-bold">Failed to load file (${localFile.name})</div><br>
          File must be a comma-separated value (CSV) file with extension '.csv'.
        `)
      }

      parse({ local: localFile })
        .then((results) => {
          this.file.input = null
          this.$refs.fileInput.blur()
          if (results.errors.length > 0) {
            return this.setError('file', `
              <strong>Failed to load file (${localFile.name})</strong><br><br>
              ${results.errors[0].message} (Row ${results.errors[0].row})
            `)
          }
          if (results.data.length > 50000) {
            return this.setError('file', `
              <strong>File Too Large (${localFile.name})</strong><br>
              Files cannot have more than 50,000 rows or the application may become unresponsive or crash.<br>
              Reduce the file size by including fewer individuals, limiting the overall time period, or aggregating
                time steps (e.g. hourly to daily timesteps).
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
            local: localFile
          }
          this.file.parsed = results
          this.file.status = 'SUCCESS'
          this.resetColumns()
          this.resetVariables()
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
    // Step 2: Columns
    resetColumns () {
      if (!this.file.value || !this.file.parsed) {
        this.columns.status = 'READY'
        this.columns.value.id = null
        this.columns.value.datetime = null
        this.columns.value.latitude = null
        this.columns.value.longitude = null
      } else if (this.columns.status !== 'READY') {
        const fields = this.file.parsed.meta.fields
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

        this.validateColumns()
      }
    },
    validateIdColumn (values) {
      const { error } = Joi.array()
        .items(Joi.string().min(1).required())
        .validate(values)
      if (error) {

        console.log(error)
        window.e = error
        return this.setError('columns', `<strong>Invalid Value in Individual Tag ID Column</strong><br><br>${error.message || error}`)
      }
      return true
    },
    validateColumns () {
      console.log('validateColumns')

      // skip validation if project is new and form has never been submitted
      if (this.columns.status === 'READY') return true

      if (!this.file.parsed) {
        return this.setError('columns', '<strong>File not found</strong><br><br>Please return to the first step and load a new file.')
      }

      // check that form is valid
      this.$v.columns.value.$touch()
      if (this.$v.columns.value.$invalid) {
        return this.setError('columns')
      }

      // validate each column
      const c = this.columns.value
      const data = this.file.parsed.data.map(d => ({
        id: d[c.id],
        datetime: d[c.datetime],
        latitude: +d[c.latitude],
        longitude: +d[c.longitude]
      }))

      // if (!this.validateIdColumn(data.map(d => d.id))) {
      //   return
      // }
      const rowSchema = Joi.object({
        id: Joi.string().required(),
        datetime: Joi.date().iso().required(),
        latitude: Joi.number().required().min(-90).max(90),
        longitude: Joi.number().required().min(-180).max(180)
      })
      const schema = Joi.array().items(rowSchema).required()

      const { error } = schema.validate(data)

      if (error) {
        console.log(error)
        return this.setError('columns', `<strong>Failed to validate primary columns</strong><br><br>${error.message || error}`)
      }

      this.columns.status = 'SUCCESS'
      this.resetVariables()
      return true
    },
    prevColumns () {
      this.step -= 1
    },
    nextColumns () {
      this.columns.status = 'PENDING'
      this.validateColumns()
      if (this.columns.status === 'SUCCESS') {
        this.step += 1
      }
    },
    // Step 3: Variables
    resetVariables () {
      this.variables.status = 'READY'
      this.variables.error = null
      this.variable.status = 'READY'
      this.variable.error = null

      const fields = this.file.parsed.meta.fields
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

        const value = this.file.parsed.data[0][variable.id]
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
    // Step 3a: Variable
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
        this.variable.value.domain = [...new Set(this.file.parsed.data.map(d => d[this.variable.value.id]))].sort(d3.ascending)
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
        this.variable.value.domain = d3.extent(this.file.parsed.data, d => +d[this.variable.value.id])
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
