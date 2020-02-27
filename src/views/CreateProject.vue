<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-0">
      <span class="title">Create New Project</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-stepper v-model="step" vertical non-linear class="mt-0 mb-4" style="border-radius:0">
      <v-stepper-step :complete="status.file === 'FINISHED'" step="1">Load dataset file</v-stepper-step>
      <v-stepper-content step="1">
        <v-card>
          <v-card-text class="py-0">
            <p>
              The dataset file must be in comma-separated values (CSV) format and contain at least four columns for the tag/individual ID, date/time, latitude, and longitude.
            </p>
            <v-file-input
              v-model="file.localFile"
              label="Select the dataset file"
              outlined
              class="mt-8"
              prepend-inner-icon="$file"
              prepend-icon=""
              @change="validateFile">
            </v-file-input>
            <div v-if="status.file === 'ERROR'">
              <v-alert type="error" outlined>
                <span v-html="stepError.file"></span>
              </v-alert>
            </div>
            <div v-else-if="status.file === 'FINISHED'">
              <v-alert type="success" outlined>
                File has been successfully loaded.<br><br>
                Please review the following information and then continue.
                <div class="mt-4">
                  Filename: <strong>{{ file.localFile.name }}</strong><br>
                  # Rows: <strong>{{ file.parsedFile.data.length.toLocaleString() }}</strong><br>
                  Columns: <strong>{{ file.parsedFile.meta.fields.join(', ') }}</strong>
                </div>
              </v-alert>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="submitFile" class="ml-2" :disabled="status.file !== 'FINISHED'">continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step :complete="status.columns === 'FINISHED'" step="2">Define primary variables</v-stepper-step>
      <v-stepper-content step="2">
        <v-card>
          <v-card-text class="py-0" v-if="file.parsedFile">
            <p>
              Select the column names for the primary variables.
            </p>

            <v-row>
              <v-col>
                <v-select
                  :items="file.parsedFile.meta.fields"
                  v-model="columns.id"
                  label="Select individual (tag) ID column"
                  outlined
                  required
                  :error-messages="columnsIdErrors"
                  @input="$v.columns.id.$touch()"
                  @blur="$v.columns.id.$touch()"
                ></v-select>
              </v-col>
              <v-col>
                <v-select
                  :items="file.parsedFile.meta.fields"
                  v-model="columns.datetime"
                  label="Select date/time column"
                  outlined
                  required
                  hint="Timestamps must be in ISO format (e.g., YYYY-MM-DD HH:mm)."
                  persistent-hint
                  :error-messages="columnsDatetimeErrors"
                  @input="$v.columns.datetime.$touch()"
                  @blur="$v.columns.datetime.$touch()"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  :items="file.parsedFile.meta.fields"
                  v-model="columns.latitude"
                  label="Select latitude variable"
                  outlined
                  required
                  hint="Latitude must be in decimal degrees."
                  persistent-hint
                  :error-messages="columnsLatitudeErrors"
                  @input="$v.columns.latitude.$touch()"
                  @blur="$v.columns.latitude.$touch()"
                ></v-select>
              </v-col>
              <v-col>
                <v-select
                  :items="file.parsedFile.meta.fields"
                  v-model="columns.longitude"
                  label="Select longitude variable"
                  outlined
                  required
                  hint="Longitude must be in decimal degrees. Values should be negative for locations in the U.S."
                  persistent-hint
                  :error-messages="columnsLongitudeErrors"
                  @input="$v.columns.longitude.$touch()"
                  @blur="$v.columns.longitude.$touch()"
                ></v-select>
              </v-col>
            </v-row>
            <v-row v-if="status.columns === 'ERROR' && stepError.columns">
              <v-col>
                <v-alert type="error" outlined>
                  <span v-html="stepError.columns"></span>
                </v-alert>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text v-else>
            <v-alert type="error" outlined>
              File has not been validated. Return to previous step.
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-btn color="default" @click="goBackColumns" class="mx-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
            <v-btn color="primary" @click="submitColumns" class="mx-4 pl-4">continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step :complete="status.variable === 'FINISHED'" step="3">Define additional variables</v-stepper-step>
      <v-stepper-content step="3">
        <v-card>
          <v-card-text class="py-0" v-if="variables.length > 0">
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
                <div>Additional Columns</div>
                <v-list>
                  <v-list-item-group v-model="selectedVariableIndex" color="primary">
                    <v-list-item v-for="variable in variables" :key="'variable-' + variable.id">
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
              <v-col md="7" class="ml-2">
                <v-text-field
                  v-model="variable.name"
                  name="variableName"
                  label="Variable label"
                  counter
                  required
                  outlined
                  :error-messages="variableNameErrors"
                  @input="$v.variable.name.$touch()"
                  @blur="$v.variable.name.$touch()"
                ></v-text-field>
                <v-select
                  :items="variableTypeOptions"
                  item-value="value"
                  item-text="label"
                  v-model="variable.type"
                  label="Type of variable"
                  outlined
                  required
                  :error-messages="variableTypeErrors"
                  @input="$v.variable.type.$touch()"
                  @blur="$v.variable.type.$touch()"
                ></v-select>
                <div>Include this variable in the following options:</div>
                <v-row>
                  <v-col class="pt-0">
                    <v-checkbox hide-details label="Crossfilter" v-model="variable.filter"></v-checkbox>
                    <v-checkbox hide-details label="Color" v-model="variable.color"></v-checkbox>
                  </v-col>
                  <v-col class="pt-0">
                    <v-checkbox hide-details label="Size" :disabled="variable.type === 'discrete'" v-model="variable.size"></v-checkbox>
                    <v-checkbox hide-details label="Outline" :disabled="variable.type === 'continuous'" v-model="variable.outline"></v-checkbox>
                  </v-col>
                </v-row>
                <v-alert type="error" :value="stepError.variable" class="mt-4" outlined>
                  <span v-html="stepError.variable"></span>
                </v-alert>
                <v-card-actions class="px-0 mt-4">
                  <v-btn color="success" @click="nextVariable(false)"><v-icon left>mdi-plus-circle</v-icon> Add Variable</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn color="default" @click="nextVariable(true)"><v-icon left>mdi-skip-next-circle-outline</v-icon>Skip</v-btn>
                </v-card-actions>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text v-else>
            <p>Dataset does not contain any additional variables, please continue.</p>
          </v-card-text>
          <v-alert type="error" :value="status.allVariables === 'ERROR'" class="mt-8" outlined>
            {{stepError.allVariables}}
          </v-alert>
          <v-card-actions class="mt-4">
            <v-btn color="default" @click="goBackVariable" class="mx-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
            <v-btn color="primary" @click="submitVariable" class="mx-4 pl-4">Continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step step="4">Finish</v-stepper-step>
      <v-stepper-content step="4">
        <v-card>
          <v-card-text>
            <v-alert type="success" outlined>
              <span class="title">All done!</span><br><br>
              You can change any of these options or upload a new version of the dataset by opening the <strong>Project Settings</strong>.<br><br>
              You can also <strong>Publish</strong> your project to save it to the TAME server and make it available to other users.
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-btn color="default" @click="step -= 1" class="mx-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
            <v-btn color="primary" @click="submit" :loading="status.review === 'PENDING'" class="mx-4 pl-4">Finish <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>
    </v-stepper>

    <v-card-actions class="mx-4 pb-4">
      <v-spacer></v-spacer>
      <v-btn to="/">close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { helpers, required, minLength, maxLength } from 'vuelidate/lib/validators'
import { mapGetters, mapActions } from 'vuex'
import Papa from 'papaparse'
import Joi from '@hapi/joi'
import * as d3 from 'd3'

const alphaNum = helpers.regex('alphaNum', /^[a-zA-Z0-9\-_. \\(\\)]*$/)

export default {
  name: 'CreateProject',
  mixins: [validationMixin],
  validations: {
    columns: {
      id: { required },
      datetime: { required },
      latitude: { required },
      longitude: { required }
    },
    variable: {
      name: { required, alphaNum, minLength: minLength(2), maxLength: maxLength(25) },
      type: { required }
    }
  },
  data () {
    return {
      step: 1,
      file: {
        localFile: null,
        parsedFile: null
      },
      columns: {
        id: null,
        datetime: null,
        latitude: null,
        longitude: null
      },
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
      variables: [],
      selectedVariableIndex: 0,
      variable: null,
      status: {
        file: 'READY',
        columns: 'READY',
        variable: 'READY',
        allVariables: 'READY',
        review: 'READY'
      },
      stepError: {
        file: null,
        columns: null,
        variable: null,
        allVariables: null,
        review: null
      }
    }
  },
  computed: {
    ...mapGetters(['user']),
    columnsIdErrors () {
      const errors = []
      if (this.status.columns === 'READY') return errors
      !this.$v.columns.id.required && errors.push('ID column is required.')
      return errors
    },
    columnsDatetimeErrors () {
      const errors = []
      if (this.status.columns === 'READY') return errors
      !this.$v.columns.datetime.required && errors.push('Datetime column is required.')
      return errors
    },
    columnsLatitudeErrors () {
      const errors = []
      if (this.status.columns === 'READY') return errors
      !this.$v.columns.latitude.required && errors.push('Latitude column is required.')
      return errors
    },
    columnsLongitudeErrors () {
      const errors = []
      if (this.status.columns === 'READY') return errors
      !this.$v.columns.longitude.required && errors.push('Longitude column is required.')
      return errors
    },
    variableNameErrors () {
      const errors = []
      if (this.status.variable === 'READY') return errors
      !this.$v.variable.name.required && errors.push('Name is required.')
      !this.$v.variable.name.alphaNum && errors.push('Name can only contain letters, numbers, spaces, or basic punctuation.')
      !this.$v.variable.name.minLength && errors.push('Name must be at least 2 characters.')
      !this.$v.variable.name.maxLength && errors.push('Name cannot be more than 25 characters.')
      return errors
    },
    variableTypeErrors () {
      const errors = []
      if (this.status.variable === 'READY') return errors
      !this.$v.variable.type.required && errors.push('Type must be assigned.')
      return errors
    }
  },
  watch: {
    selectedVariableIndex (newIndex, oldIndex) {
      if (isNaN(newIndex)) return

      this.$v.variable.$reset()
      this.status.variable = 'READY'
      this.stepError.variable = null
      this.variable = Object.assign({}, this.variables[this.selectedVariableIndex])
    }
  },
  methods: {
    ...mapActions(['loadProject']),
    submit () {
      this.status.review = 'PENDING'
      const project = {
        name: this.file.localFile.name,
        columns: this.columns,
        variables: this.variables.filter(d => !d.skip),
        file: this.file.localFile,
        isLocal: true
      }
      return this.loadProject(project)
        .then((project) => {
          console.log('project loaded:', project)
          this.status.review = 'FINISHED'
          this.$router.push({ name: 'home' })
        })
    },
    setFileError (e) {
      this.status.file = 'ERROR'
      this.stepError.file = e.message || e
    },
    validateFile () {
      console.log('validateFile', this.file.localFile)

      if (!this.file.localFile) {
        return this.resetFile()
      }

      this.status.file = 'PENDING'

      const filename = this.file.localFile.name
      const fileExtension = filename.split('.').pop().toLowerCase()

      if (fileExtension !== 'csv') {
        return this.setFileError('File type is not valid.<br><br>File must be a comma-separated value (CSV) file with extension \'.csv\'.')
      }

      Papa.parse(this.file.localFile, {
        header: true,
        comments: '#',
        delimiter: ',',
        skipEmptyLines: 'greedy',
        complete: (results) => {
          this.file.parsedFile = Object.freeze(results)
          if (results.errors.length > 0) {
            return this.setFileError(`${results.errors[0].message} (Row ${results.errors[0].row})`)
          }
          if (!results.meta.fields.every(d => d.length > 0)) {
            const index = results.meta.fields.findIndex(d => d.length === 0) + 1
            return this.setFileError(`File contains an unnamed column (column ${index}).<br><br>Please remove this column or add a name for it in the header row.`)
          }
          this.status.file = 'FINISHED'
        },
        error: (e) => {
          this.setFileError(e)
        }
      })
    },
    submitFile () {
      if (this.status.file === 'FINISHED') {
        this.step += 1
      }
    },
    resetFile () {
      this.file.localFile = null
      this.file.parsedFile = null
      this.status.file = 'READY'
      this.stepError.file = null
    },
    goBackFile () {
      this.resetFile()
      this.step -= 1
    },
    setColumnsError (e) {
      this.status.columns = 'ERROR'
      this.stepError.columns = e.message || e
    },
    submitColumns () {
      this.status.columns = 'PENDING'
      this.$v.columns.$touch()
      if (this.$v.columns.$invalid) {
        this.status.columns = 'ERROR'
        return
      }
      this.validateColumns()
        .then((result) => {
          this.resetVariable()
          this.status.columns = 'FINISHED'
          this.step += 1
        })
        .catch((e) => {
          this.setColumnsError(e)
        })
    },
    validateColumns () {
      console.log('validateColumns', this.columns)
      const rowSchema = Joi.object({
        [this.columns.id]: Joi.string().required(),
        [this.columns.datetime]: Joi.date().iso().required(),
        [this.columns.latitude]: Joi.number().required(),
        [this.columns.longitude]: Joi.number().required()
      })
      const schema = Joi.array().items(rowSchema).required()
      const data = this.file.parsedFile.data.map(d => ({
        [this.columns.id]: d[this.columns.id],
        [this.columns.datetime]: d[this.columns.datetime],
        [this.columns.latitude]: +d[this.columns.latitude],
        [this.columns.longitude]: +d[this.columns.longitude]
      }))
      return new Promise((resolve, reject) => {
        const { error, value } = schema.validate(data)
        if (error) {
          return reject(error)
        }
        resolve(value)
      })
    },
    resetColumns () {
      this.$v.columns.$reset()
      // this.columns.id = ''
      // this.columns.datetime = ''
      // this.columns.latitude = ''
      // this.columns.longitude = ''
      this.columns.id = 'uid'
      this.columns.datetime = 'datetime'
      this.columns.latitude = 'lat'
      this.columns.longitude = 'lon'
      this.status.columns = 'READY'
      this.stepError.columns = null
    },
    goBackColumns () {
      this.resetColumns()
      this.step -= 1
    },
    resetVariable () {
      this.variables = this.file.parsedFile.meta.fields
        .filter(d => !Object.values(this.columns).includes(d))
        .map(key => ({
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
        }))
      this.variables.forEach(variable => {
        // check if first value is number
        const value = this.file.parsedFile.data[0][variable.id]
        if (isNaN(+value)) {
          variable.type = 'discrete'
        } else {
          variable.type = 'continuous'
        }
        if (variable.type === 'continuous') {
          variable.size = true
        }
        // console.log(variable.id, variable.type, value, +value, isNaN(+value))
      })
      if (this.variables.length > 0) {
        this.selectedVariableIndex = 0
        this.variable = this.variables[this.selectedVariableIndex]
        this.status.allVariables = 'READY'
      } else {
        this.status.allVariables = 'FINISHED'
      }

      this.status.variable = 'READY'
      this.stepError.variable = null
      this.stepError.allVariables = null
    },
    goBackVariable () {
      this.resetVariable()
      this.step -= 1
    },
    submitVariable () {
      if (!this.variables.filter(d => !d.skip).every(d => d.valid)) {
        this.status.allVariables = 'ERROR'
        this.stepError.allVariables = 'One or more variables have not been validated. Go through the list of variables, and click the Validate button.'
        return
      }
      this.status.variable = 'FINISHED'
      this.step += 1
    },
    validateVariable () {
      this.$v.variable.$touch()
      if (this.$v.variable.$invalid) {
        return false
      }

      if (this.variable.type === 'discrete') {
        this.variable.domain = [...new Set(this.file.parsedFile.data.map(d => d[this.variable.id]))].sort(d3.ascending)
        if (this.variable.outline && this.variable.domain.length !== 2) {
          this.stepError.variable = `Variable can only be an Outline option if it has exactly 2 unique values (found ${this.variable.domain.length}: ${this.variable.domain.join(', ')}).<br><br>Unselect the Outline option and try again, or modify the dataset file and return to the beginning.`
          return false
        }
        this.variable.size = false
      } else if (this.variable.type === 'continuous') {
        this.variable.domain = d3.extent(this.file.parsedFile.data, d => +d[this.variable.id])
        this.variable.outline = false
      }
      return true
    },
    nextVariable (skip) {
      console.log('nextVariable', skip)
      if (skip) {
        this.variable.skip = true
        this.variables[this.selectedVariableIndex] = this.variable
      } else {
        if (!this.validateVariable()) {
          console.log('failed')
          this.variable.valid = false
          this.status.variable = 'ERROR'
          return
        }
        console.log('ok')
        this.$v.variable.$reset()
        this.variable.skip = false
        this.variable.valid = true
        this.variables[this.selectedVariableIndex] = this.variable
      }

      this.status.variable = 'READY'
      this.stepError.variable = null

      if (this.selectedVariableIndex < this.variables.length - 1) {
        this.selectedVariableIndex += 1
      } else {
        this.selectedVariableIndex = 0
      }
      console.log('done')

      if (this.variables.filter(d => !d.skip).every(d => d.valid)) {
        this.status.allVariables = 'FINISHED'
      }
    }
  }
}
</script>
