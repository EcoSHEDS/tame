<template>
  <v-container>
    <v-layout row wrap style="max-width:800px" mx-auto class="mt-8">
      <v-row>
        <v-col>
          <h1 class="display-2 pb-8">Create New Project</h1>
          <v-stepper v-model="step" vertical non-linear>
            <v-stepper-step :complete="status.project === 'FINISHED'" step="1">Project information</v-stepper-step>
            <v-stepper-content step="1">
              <v-card>
                <v-card-text>
                  <!-- <v-form @submit.prevent="submitProject"> -->
                    <v-text-field
                      v-model="project.name"
                      :error-messages="projectNameErrors"
                      label="Name"
                      required
                      counter
                      outlined
                      @input="$v.project.name.$touch()"
                      @blur="$v.project.name.$touch()"
                    ></v-text-field>
                    <v-textarea
                      v-model="project.description"
                      :error-messages="projectDescriptionErrors"
                      label="Brief Description"
                      required
                      counter
                      outlined
                      rows="3"
                      @input="$v.project.description.$touch()"
                      @blur="$v.project.description.$touch()"
                    ></v-textarea>

                    <div>
                      Automated ID: <code>{{ projectId }}</code>
                    </div>

                  <v-alert type="error" :value="!!stepError.project" class="mt-8">
                    {{stepError.project}}
                  </v-alert>

                </v-card-text>
                <v-card-actions>
                  <v-btn type="submit" color="primary" class="pl-4 mr-4" :loading="status.project === 'PENDING'" @click="submitProject">continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <v-stepper-step :complete="status.file === 'FINISHED'" step="2">Upload dataset file</v-stepper-step>
            <v-stepper-content step="2">
              <v-card>
                <v-card-text>
                  <v-file-input
                    v-model="file.localFile"
                    label="Select the dataset file"
                    outlined
                    hint="Note: to re-upload a file after modifying it, first clear the selection and select the file again."
                    persistent-hint
                    class="mb-4"
                    prepend-inner-icon="$file"
                    prepend-icon=""
                    @change="validateFile">
                  </v-file-input>
                  <div v-if="status.file === 'PENDING'">
                    Validating file...
                  </div>
                  <div v-else-if="status.file === 'ERROR'">
                    <v-alert type="error" outlined>
                      <span v-html="stepError.file"></span>
                    </v-alert>
                  </div>
                  <div v-else-if="status.file === 'FINISHED'">
                    <div>
                      <div class="subtitle-2">
                        File Information
                      </div>
                      <div class="ml-4">
                        Filename: <strong>{{ file.localFile.name }}</strong><br>
                        # Rows: <strong>{{ file.parsedFile.data.length.toLocaleString() }}</strong><br>
                        Columns: <strong>{{ file.parsedFile.meta.fields.join(', ') }}</strong>
                      </div>
                    </div>
                    <v-alert type="success" outlined class="mt-8">
                      File has been successfully validated, please continue.
                    </v-alert>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="default" @click="goBackFile" class="mx-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
                  <v-btn color="primary" @click="submitFile" class="mx-4 pl-4" :disabled="status.file !== 'FINISHED'">continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <v-stepper-step :complete="status.columns === 'FINISHED'" step="3">Define primary variables</v-stepper-step>
            <v-stepper-content step="3">
              <v-card>
                <v-card-text v-if="file.parsedFile">
                  <v-row>
                    <v-col md="6">
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
                    <v-col md="6">
                      <v-select
                        :items="file.parsedFile.meta.fields"
                        v-model="columns.datetime"
                        label="Select date/time column"
                        outlined
                        required
                        :error-messages="columnsDatetimeErrors"
                        @input="$v.columns.datetime.$touch()"
                        @blur="$v.columns.datetime.$touch()"
                      ></v-select>
                    </v-col>
                  </v-row>
                  <v-row>

                    <v-col md="6">
                      <v-select
                        :items="file.parsedFile.meta.fields"
                        v-model="columns.latitude"
                        label="Select latitude variable"
                        outlined
                        required
                        :error-messages="columnsLatitudeErrors"
                        @input="$v.columns.latitude.$touch()"
                        @blur="$v.columns.latitude.$touch()"
                      ></v-select>
                    </v-col>
                    <v-col md="6">
                      <v-select
                        :items="file.parsedFile.meta.fields"
                        v-model="columns.longitude"
                        label="Select longitude variable"
                        outlined
                        required
                        :error-messages="columnsLongitudeErrors"
                        @input="$v.columns.longitude.$touch()"
                        @blur="$v.columns.longitude.$touch()"
                      ></v-select>
                    </v-col>
                  </v-row>
                  <v-row v-if="status.columns === 'ERROR'">
                    <v-col>
                      <v-alert type="error" outlined>
                        <span v-html="stepError.columns"></span>
                      </v-alert>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-text v-else>
                  <v-alert type="error">
                    File has not been validated. Return to previous step.
                  </v-alert>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="default" @click="goBackColumns" class="mx-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
                  <v-btn color="primary" @click="submitColumns" class="mx-4 pl-4">continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <v-stepper-step :complete="status.variable === 'FINISHED'" step="4">Define additional variables</v-stepper-step>
            <v-stepper-content step="4">
              <v-card>
                <v-card-text v-if="variables.length > 0">
                  <v-row>
                    <v-col md="4" class="mr-2">
                      <div>Columns</div>
                      <v-list>
                        <v-list-item-group v-model="selectedVariableIndex" color="primary">
                          <v-list-item v-for="variable in variables" :key="'variable-' + variable.id">
                            <v-list-item-content>
                              <v-list-item-title>
                                <v-icon left v-if="variable.valid" color="success">mdi-check-circle-outline</v-icon>
                                <v-icon left v-else>mdi-checkbox-blank-circle-outline</v-icon>
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
                        name="variableId"
                        label="Column"
                        disabled
                        required
                        outlined
                        :value="variable.id"
                      ></v-text-field>
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
                      <v-text-field
                        v-model="variable.description"
                        name="variableDescription"
                        label="Description (optional)"
                        counter
                        required
                        outlined
                        :error-messages="variableDescriptionErrors"
                        @input="$v.variable.description.$touch()"
                        @blur="$v.variable.description.$touch()"
                      ></v-text-field>
                      <v-row>
                        <v-col>
                          <v-checkbox label="Crossfilter" v-model="variable.filter"></v-checkbox>
                          <v-checkbox label="Color" v-model="variable.color"></v-checkbox>
                        </v-col>
                        <v-col>
                          <v-checkbox label="Size" :disabled="variable.type === 'discrete'" v-model="variable.size"></v-checkbox>
                          <v-checkbox label="Outline" :disabled="variable.type === 'continuous'" v-model="variable.outline"></v-checkbox>
                        </v-col>
                      </v-row>
                      <v-btn color="primary" @click="nextVariable">Validate and continue</v-btn>
                      <v-alert type="error" :value="variableError" class="mt-8">
                        <span v-html="variableError"></span>
                      </v-alert>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-text v-else>
                  <p>Dataset does not contain any other variables, please continue.</p>
                </v-card-text>
                <v-alert type="error" :value="status.allVariables === 'ERROR'" class="mt-8">
                  {{stepError.allVariables}}
                </v-alert>
                <v-card-actions>
                  <v-btn color="default" @click="goBackVariable" class="mx-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
                  <v-btn color="primary" @click="submitVariable" :disabled="status.allVariables !== 'FINISHED'" class="mx-4 pl-4">Continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <v-stepper-step step="5">Review</v-stepper-step>
            <v-stepper-content step="5">
              <v-card>
                <v-card-text>
                  <p>Review project...</p>
                  <v-alert type="error" :value="status.review === 'ERROR'">
                    <span v-html="stepError.review"></span>
                  </v-alert>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="default" @click="step -= 1" class="mx-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
                  <v-btn color="primary" @click="submit" :loading="status.review === 'PENDING'" class="mx-4 pl-4">Finish <v-icon right>mdi-chevron-right</v-icon></v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>
          </v-stepper>
        </v-col>
      </v-row>
    </v-layout>
  </v-container>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { helpers, required, minLength, maxLength } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import Papa from 'papaparse'
import slugify from 'slugify'
import Joi from '@hapi/joi'
import * as d3 from 'd3'

const alphaNum = helpers.regex('alphaNum', /^[a-zA-Z0-9\-_. \\(\\)]*$/)

export default {
  name: 'CreateProject',
  mixins: [validationMixin],
  validations: {
    project: {
      name: { required, alphaNum, minLength: minLength(6), maxLength: maxLength(100) },
      description: { required, minLength: minLength(6), maxLength: maxLength(500) }
    },
    columns: {
      id: { required },
      datetime: { required },
      latitude: { required },
      longitude: { required }
    },
    variable: {
      name: { required, alphaNum, minLength: minLength(2), maxLength: maxLength(25) },
      description: { maxLength: maxLength(25) },
      type: { required }
    }
  },
  data () {
    return {
      step: 1,
      project: {
        name: 'Test Project',
        description: 'A brief description of the test project'
        // id: '',
        // name: '',
        // description: ''
      },
      file: {
        localFile: null,
        parsedFile: null
      },
      columns: {
        // id: null,
        // datetime: null,
        // latitude: null,
        // longitude: null
        id: 'uid',
        datetime: 'datetime',
        latitude: 'lat',
        longitude: 'lon'
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
      variableError: null,
      variables: [],
      selectedVariableIndex: 0,
      variable: null,
      status: {
        project: 'READY',
        file: 'READY',
        columns: 'READY',
        variable: 'READY',
        allVariables: 'READY',
        review: 'READY'
      },
      stepError: {
        project: null,
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
    projectId () {
      return slugify(this.project.name, { lower: true, remove: /[*+~.,()'"!:@]/g })
    },
    projectNameErrors () {
      const errors = []
      if (this.status.project === 'READY') return errors
      !this.$v.project.name.required && errors.push('Name is required.')
      !this.$v.project.name.alphaNum && errors.push('Name can only contain letters, numbers, spaces, or basic punctuation.')
      !this.$v.project.name.minLength && errors.push('Name must be at least 6 characters.')
      !this.$v.project.name.maxLength && errors.push('Name cannot be more than 100 characters.')
      return errors
    },
    projectDescriptionErrors () {
      const errors = []
      if (this.status.project === 'READY') return errors
      !this.$v.project.description.required && errors.push('Description is required.')
      !this.$v.project.description.minLength && errors.push('Description must be at least 6 characters.')
      !this.$v.project.description.maxLength && errors.push('Description cannot be more than 500 characters.')
      return errors
    },
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
    variableDescriptionErrors () {
      const errors = []
      if (this.status.variable === 'READY') return errors
      !this.$v.variable.description.maxLength && errors.push('Description cannot be more than 100 characters.')
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
    submit () {
      this.status.review = 'PENDING'
      const project = Object.assign({}, this.project)
      project.id = this.projectId
      const version = {
        projectId: project.id,
        config: {
          columns: this.columns,
          variables: this.variables
        }
      }
      this.$Amplify.Auth.currentSession()
        .then(data => data.getIdToken().getJwtToken())
        .then((token) => {
          return this.$http.post('/projects', project, {
            headers: {
              Authorization: token
            }
          }).then(response => response.data)
            .then(data => ({ savedProject: data, token }))
        })
        .then(({ savedProject, token }) => {
          return this.$http.post(`/projects/${savedProject.id}/versions`, version, {
            headers: {
              Authorization: token
            }
          }).then(response => response.data)
            .then(data => ({ savedProject, savedVersion: data, token }))
        })
        .then(result => {
          console.log(result)
          this.status.review = 'FINISHED'
          setTimeout(() => {
            this.$router.push({ name: 'projects' })
          }, 1000)
        })
        .catch(e => {
          this.status.review = 'ERROR'
          this.stepError.review = e.message || e
        })
    },
    setProjectError (e) {
      this.status.project = 'ERROR'
      this.stepError.project = e.message || e
    },
    resetProject () {
      this.$v.project.$reset()
      this.project.id = ''
      this.project.name = ''
      this.project.description = ''
    },
    submitProject () {
      this.status.project = 'PENDING'
      this.stepError.project = null
      this.$v.project.$touch()
      if (this.$v.project.$invalid) {
        this.status.project = 'ERROR'
        return
      }
      this.$http.get(`/projects/${this.projectId}`)
        .then(() => {
          this.setProjectError('Project with a similar name already exists and has the same ID. Please change the project name.')
        })
        .catch((e) => {
          if (e.response && e.response.status === 404) {
            this.status.project = 'FINISHED'
            this.step = 2
          } else {
            this.setProjectError(e)
          }
        })
    },
    setFileError (e) {
      this.status.file = 'ERROR'
      this.stepError.file = e.message || e
    },
    validateFile () {
      console.log('validateFile', this.file.localFile)
      this.status.file = 'PENDING'

      const filename = this.file.localFile.name
      const fileExtension = filename.split('.').pop().toLowerCase()

      if (fileExtension !== 'csv') {
        return this.setFileError('File type is not valid.<br>File must be a comma-separated value (CSV) file with extension \'.csv\'.')
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
          this.status.file = 'FINISHED'
        },
        error: (e) => {
          this.setFileError(e)
        }
      })
    },
    submitFile () {
      if (this.status.file === 'FINISHED') {
        this.step = 3
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
      this.step = 1
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
          this.step = 4
        })
        .catch((e) => {
          this.setColumnsError(e)
        })
    },
    validateColumns () {
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
      this.step = 2
    },
    resetVariable () {
      this.variables = this.file.parsedFile.meta.fields
        .filter(d => !Object.values(this.columns).includes(d))
        .map(key => ({
          id: key,
          name: null,
          description: null,
          type: null,
          domain: null,
          filter: true,
          color: true,
          size: false,
          outline: false,
          valid: false
        }))
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
      this.step = 3
    },
    submitVariable () {
      if (!this.variables.every(d => d.valid)) {
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
          this.variableError = `Variable can only be an Outline option if it has exactly 2 unique values. Unselect the Outline option, and click Validate again.<br><br>Found ${this.variable.domain.length} values (${this.variable.domain.join(', ')})`
          return false
        }
        this.variable.size = false
      } else if (this.variable.type === 'continuous') {
        this.variable.domain = d3.extent(this.file.parsedFile.data, d => +d[this.variable.id])
        this.variable.outline = false
      }
      return true
    },
    nextVariable () {
      if (!this.validateVariable()) {
        this.status.variable = 'ERROR'
        return
      }
      this.$v.variable.$reset()
      this.variable.valid = true
      this.variables[this.selectedVariableIndex] = this.variable

      this.status.variable = 'READY'
      this.variableError = null

      if (this.selectedVariableIndex < this.variables.length - 1) {
        this.selectedVariableIndex += 1
      }

      if (this.variables.every(d => d.valid)) {
        this.status.allVariables = 'FINISHED'
      }
    }
  }
}
</script>
