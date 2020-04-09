<template>
  <v-card>
    <v-toolbar color="primary" dark class="mb-0">
      <span class="title" v-if="isNew">Create a New Project</span>
      <span class="title" v-else>Edit Project</span>
      <v-spacer></v-spacer>
      <v-btn icon small to="/" class="mr-0"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>

    <v-stepper v-model="step" vertical class="elevation-0 pb-4">
      <v-stepper-step :rules="[() => file.status !== 'ERROR']" :complete="file.status === 'SUCCESS'" step="1">Load dataset file</v-stepper-step>
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
              :label="isNew ? 'Select a file...' : 'To replace your dataset, select a new file...'"
              outlined
              class="mb-4 mt-8"
              prepend-inner-icon="$file"
              prepend-icon
              hide-details
              truncate-length="100"
              @change="loadLocalFile">
            </v-file-input>
            <div v-if="file.status === 'SUCCESS'">
              <v-alert type="success" dense text border="left" :value="!!file.value" class="body-2">
                <div class="body-1 font-weight-bold" v-if="!!file.value.local">
                  File Successfully Loaded from Your Computer
                </div>
                <div class="body-1 font-weight-bold" v-else-if="!file.value.local">
                  File Successfully Loaded from the Server
                </div>
                <div class="my-4 font-family-mono">
                  <!-- Filename: <strong>{{ file.value.name }}</strong><br>
                  &nbsp;&nbsp;# Rows: <strong></strong><br>
                  &nbsp;: <strong>{{  }}</strong> -->
                  <v-row no-gutters>
                    <v-col cols="2" class="px-1 py-1 text-right">Filename:</v-col>
                    <v-col cols="10" class="px-1 py-1 font-weight-bold">{{ file.value.name }}</v-col>
                    <v-col cols="2" class="px-1 py-1 text-right">Filesize:</v-col>
                    <v-col cols="10" class="px-1 py-1 font-weight-bold">{{ file.value.size | prettyBytes(1) }}</v-col>
                    <v-col cols="2" class="px-1 py-1 text-right"># Rows:</v-col>
                    <v-col cols="10" class="px-1 py-1 font-weight-bold">{{ file.parsed.data.length.toLocaleString() }}</v-col>
                    <v-col cols="2" class="px-1 py-1 text-right">Columns:</v-col>
                    <v-col cols="10" class="px-1 py-1 font-weight-bold">{{ file.parsed.meta.fields.join(', ') }}</v-col>
                  </v-row>
                </div>
                <div class="mt-4">
                  To replace the dataset with a new version, select a new file on your computer using the input box above.
                  Note that the entire dataset must be replaced, TAME does not currently support appending new observations to an existing dataset.
                </div>
              </v-alert>
              <v-alert type="warning" dense text border="left" :value="file.parsed.data.length >= 10000" class="body-2">
                <div class="body-1 font-weight-bold">Large File Detected</div>
                <div class="mb-4">
                  Datasets with more than 10,000 rows can cause TAME to become sluggish.
                </div>
                <div class="my-4 body-1 font-weight-medium">
                  For optimal performance, enable dataset aggregation in Step 4 of this form.
                </div>
                <div class="mt-4">
                  Alternatively, reduce the size of the dataset by removing some individuals or by selecting a shorter time period, and then reload the CSV file.
                </div>
              </v-alert>
              <v-alert type="warning" dense text border="left" :value="file.value && (file.value.size / 1024 / 1024) >= 5" class="body-2">
                <div class="body-1 font-weight-bold">Project Will Not Be Publishable</div>
                <div class="mb-4">
                  A project can only be published to the server if the file size is less than 5 MB (current file is {{ file.value.size | prettyBytes(1) }}).
                </div>
                <div class="mt-4">
                  You can continue to load this file into TAME, but you will not be able to publish it for other users to access unless the file size is reduced by removing rows and/or columns.
                </div>
              </v-alert>
            </div>
            <v-alert type="error" dense text border="left" :value="file.status === 'ERROR'" class="body-2">
              <span v-html="file.error"></span>
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="nextFile" class="ml-2 pl-4" :disabled="file.status !== 'SUCCESS'" :loading="file.status === 'PENDING'">continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step :rules="[() => columns.status !== 'ERROR']" :complete="columns.status === 'SUCCESS'" step="2">Select primary variables</v-stepper-step>
      <v-stepper-content step="2">
        <v-card>
          <v-card-text class="py-0" v-if="file.value">
            <div class="subtitle-1 font-weight-medium">Instructions</div>
            <p>
              Select the column name for each of the four primary variables.
            </p>

            <v-row class="mt-4">
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
            <v-alert type="error" dense text border="left" :value="columns.status === 'ERROR' && !!columns.error" class="body-2">
              <span v-html="columns.error"></span>
            </v-alert>
          </v-card-text>
          <v-card-text v-else>
            <v-alert type="error" dense text border="left" class="body-2">
              <div class="body-1 font-weight-bold">File Not Found</div>
              <div>Please return to previous step to load a file.</div>
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="default" @click="prevColumns" class="ml-2 mr-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
            <v-btn color="primary" @click="nextColumns" class="pl-4" :loading="columns.status === 'PENDING'">continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step :rules="[() => variables.status !== 'ERROR']" :complete="variables.status === 'SUCCESS'" :loading="variables.status === 'PENDING'" step="3">Configure additional variables</v-stepper-step>
      <v-stepper-content step="3">
        <v-card>
          <v-card-text class="py-0" v-if="variables.value.length > 0">
            <div class="subtitle-1 font-weight-medium">Instructions</div>
            <p>
              For each additional variable, provide a brief label, select the type (continuous or discrete),
              and specify which options can be used with this variable
              (e.g. for generating crossfilter histograms or for assigning colors to the observed locations).
            </p>
            <p>
              By default, the form will include all additional variables. To exclude a specific variable,
              selecting it from the list and check the "Exclude Variable" option.
            </p>
            <p>
              The form will use the column name as the default label, and make an educated guess about the type of each variable.
              Only continuous variables can be used for the Size option, and only discrete variables with two unique values
              can be used for the Outline option.
            </p>
            <v-row class="mt-8">
              <v-col md="4" class="mr-2">
                <div>Column Names</div>
                <div style="max-height: 400px; overflow-y:auto">
                  <v-list>
                    <v-list-item-group v-model="variableIndex" color="primary">
                      <v-list-item v-for="(variable, i) in variables.value" :key="'variable-' + i">
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
                </div>
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
                  :disabled="variable.value.skip"
                  @change="validateVariable(variable.value)">
                </v-text-field>
                <v-select
                  :items="variableTypeOptions"
                  item-value="value"
                  item-text="label"
                  v-model="variable.value.type"
                  label="Type of variable"
                  outlined
                  required
                  :disabled="variable.value.skip"
                  @change="validateVariable(variable.value)">
                </v-select>
                <div>Include this variable as an option for:</div>
                <div class="ml-4">
                  <v-checkbox
                    hide-details
                    :disabled="variable.value.skip"
                    class="mt-0"
                    label="Color Variable"
                    v-model="variable.value.color"
                    @change="validateVariable(variable.value)"></v-checkbox>
                  <v-checkbox
                    hide-details
                    :disabled="variable.value.skip || variable.value.type === 'discrete'"
                    class="mt-0"
                    :label="`Size Variable ${variable.value.type === 'discrete' ? '(Continuous Variables Only)' : ''}`"
                    v-model="variable.value.size"
                    @change="validateVariable(variable.value)"></v-checkbox>
                  <v-checkbox
                    hide-details
                    :disabled="variable.value.skip || variable.value.type === 'continuous'"
                    class="mt-0"
                    :label="`Outline Variable ${variable.value.type === 'continuous' ? '(Discrete Variables Only)' : ''}`"
                    v-model="variable.value.outline"
                    @change="validateVariable(variable.value)"></v-checkbox>
                  <v-checkbox
                    hide-details
                    :disabled="variable.value.skip"
                    class="mt-0"
                    label="Crossfilter"
                    v-model="variable.value.filter"
                    @change="validateVariable(variable.value)"></v-checkbox>
                </div>
                <div class="mt-4">Exclude this variable from the dataset:</div>
                <div class="ml-4">
                  <v-checkbox
                    v-model="variable.value.skip"
                    label="Exclude Variable"
                    color="error"
                    hide-details
                    class="mt-0"
                    @change="validateVariable(variable.value)"></v-checkbox>
                </div>
                <v-alert type="error" dense text border="left" :value="!variable.value.valid && !!variable.value.error" class="mt-4 mb-0 body-2">
                  <span v-html="variable.value.error"></span>
                </v-alert>
              </v-col>
              <v-col md="7" class="ml-2" v-else>
                <v-alert type="info" prominent outlined icon="mdi-chevron-left">
                  Select a column from the list
                </v-alert>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text v-else class="py-0">
            <v-alert type="info" dense text border="left" class="body-2">
              <div class="body-1 font-weight-bold">Additional Variables Not Found</div>
              <div>Dataset file does not contain any additional variables. Please continue to the final step.</div>
            </v-alert>
          </v-card-text>
          <v-alert type="error" dense text border="left" :value="variables.status === 'ERROR' && !!variables.error" class="mt-8 body-2">
            <span v-html="variables.error"></span>
          </v-alert>
          <v-card-actions class="mt-4">
            <v-btn text color="default" @click="prevVariables" class="ml-2 mr-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
            <v-btn color="primary" @click="nextVariables" class="pl-4">Continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step :rules="[() => aggregation.status !== 'ERROR']" :complete="aggregation.status === 'SUCCESS'" :loading="aggregation.status === 'PENDING'" step="4">Dataset aggregation</v-stepper-step>
      <v-stepper-content step="4">
        <v-card>
          <v-card-text class="py-0">
            <div class="subtitle-1 font-weight-medium">Instructions</div>
            <p>
              To reduce the size of the dataset, use one of the daily aggregation options below.
            </p>

            <v-alert type="warning" dense text border="left" :value="file.parsed && file.parsed.data.length > aggregation.maxRows" class="body-2">
              <div class="body-1 font-weight-bold">Aggregation Required</div>
              <div class="mb-2">
                Current dataset has more than {{ aggregation.maxRows.toLocaleString() }} rows, which would cause TAME to crash or become too slugish.
              </div>
              <div>Please select an aggregation option below to reduce the size of the dataset.</div>
            </v-alert>
            <v-alert type="info" dense text border="left" :value="file.parsed && file.parsed.data.length <= aggregation.maxRows && file.parsed.data.length > 10000" class="body-2">
              <div class="body-1 font-weight-bold">Aggregation Recommended</div>
              <div>
                Current dataset has more than 10,000 rows, which may cause TAME to crash or become too slugish depending on the speed of your computer.
              </div>
            </v-alert>

            <v-row class="mt-2" no-gutters>
              <v-col cols="12">
                <div class="body-2 font-weight-medium">For each individual and date, include:</div>
                <v-radio-group v-model="aggregation.value" class="ml-4" dense @change="validateAggregation">
                  <v-radio
                    value="none"
                    label="All observations (no aggregation)"
                    :disabled="file.parsed && file.parsed.data.length > aggregation.maxRows">
                  </v-radio>
                  <v-radio
                    value="maxDistance"
                    label="Only the observation with the longest distance to the next observed location">
                  </v-radio>
                  <v-radio
                    value="firstDay"
                    label="Only the first observation of the day">
                  </v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <!-- <pre>{{ aggregation.value }}</pre> -->

            <v-alert type="error" text border="left" dense :value="aggregation.status === 'ERROR' && !!aggregation.error" class="mt-2 body-2">
              <span v-html="aggregation.error"></span>
            </v-alert>
          </v-card-text>
          <v-card-actions class="mt-4">
            <v-btn text color="default" @click="prevAggregation" class="ml-2 mr-4 pr-4"><v-icon left>mdi-chevron-left</v-icon> Go Back</v-btn>
            <v-btn color="primary" @click="nextAggregation" class="pl-4">Continue <v-icon right>mdi-chevron-right</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-stepper-content>

      <v-stepper-step :complete="finish.status === 'SUCCESS'" step="5">Finish</v-stepper-step>
      <v-stepper-content step="5">
        <v-card>
          <v-card-text v-if="!(project && project.id)">
            <v-alert type="success" dense text border="left" class="body-2">
              <div class="body-1 font-weight-bold">All done!</div>
              <div class="my-2">
                You can change any of these options or load a new version of the dataset by clicking the <span class="font-weight-bold">Edit Project</span> button.
              </div>
              <div class="mt-2" v-if="file.value && (file.value.size / 1024 / 1024) < 5">
                You can also <span class="font-weight-bold">Publish</span> your project to save it to the TAME server and make it available to other users.
              </div>
              <div class="mt-2" v-else>
                You will not be able to publish this project because the file size exceeds the 5 MB limit.
              </div>
            </v-alert>
          </v-card-text>
          <v-card-text v-else class="pb-0">
            <v-alert type="success" text border="left" dense class="body-2">
              <div class="body-1 font-weight-bold">All done!</div>
              <div>Please click the Finish button to apply these changes.</div>
            </v-alert>
            <v-alert type="warning" text border="left" dense class="body-2">
              <div class="body-1 font-weight-bold">Changes will NOT be automatically saved to server</div>
              <div>After clicking the Finish button and reviewing your changes in TAME, you must re-publish this project
              in order to save these changes to the server.</div>
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
      <v-btn
        :disabled="file.status !== 'SUCCESS' || columns.status !== 'SUCCESS' || variables.status !== 'SUCCESS' || aggregation.status !== 'SUCCESS'"
        @click="submit"
        :loading="finish.status === 'PENDING'"
        color="primary"
        v-if="!isNew">Save Changes</v-btn>
      <v-spacer></v-spacer>
      <v-btn to="/" text>close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
import { mapGetters, mapActions } from 'vuex'

import parse from '@/lib/parse'
import { validateDatasetColumns } from '@/lib/dataset'

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
        name: { required, minLength: minLength(1), maxLength: maxLength(50) },
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
        // status: 'READY',
        // error: null,
        value: null
      },
      aggregation: {
        status: 'READY',
        error: null,
        maxRows: 20000,
        value: 'none'
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
      !this.$v.variable.value.name.required && errors.push('Label is required.')
      !this.$v.variable.value.name.minLength && errors.push('Label must be at least 1 character.')
      !this.$v.variable.value.name.maxLength && errors.push('Label cannot be more than 50 characters.')
      return errors
    }
  },
  watch: {
    variableIndex (newIndex, oldIndex) {
      this.selectVariableIndex(newIndex)
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
      this.aggregation.value = project.aggregation || 'none'
      this.aggregation.status = 'SUCCESS'
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
        file: this.file.value,
        columns: this.columns.value,
        variables: this.variables.value,
        aggregation: this.aggregation.value
      }

      if (this.project && this.project.id) {
        project = {
          ...this.project,
          ...project
        }
      } else {
        project.name = this.file.value.name
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
          <div class="body-1 font-weight-bold">Failed to load file (${localFile.name})</div>
          <div>File must be a comma-separated value (CSV) file with extension '.csv'.</div>
        `)
      }

      parse({ local: localFile })
        .then((results) => {
          this.file.input = null
          this.$refs.fileInput.blur()
          if (results.errors.length > 0) {
            return this.setError('file', `
              <div class="body-1 font-weight-bold">Failed to load file (${localFile.name})</div>
              <div class="mt-2">${results.errors[0].message} (Row ${results.errors[0].row})</div>
            `)
          }
          if (results.data.length > 500000) {
            return this.setError('file', `
              <div class="body-1 font-weight-bold">File Too Large (${localFile.name})</div>
              <div class="mb-2">Files cannot have more than 500,000 rows or the application may become unresponsive or crash.</div>
              <div class="mt-2">Reduce dataset size by removing some individuals, limiting the overall time period, or aggregate to less frequent
                time steps (e.g. hourly to daily). Then reload the CSV file.</div>
            `)
          }
          if (!results.meta.fields.every(d => d.length > 0)) {
            const index = results.meta.fields.findIndex(d => d.length === 0) + 1
            return this.setError('file', `
              <div class="body-1 font-weight-bold">Failed to load file (${localFile.name})</div>
              <div class="mb-2">File contains an unnamed column (column ${index}).</div>
              <div class="mt-2">Please remove this column or add a name for it in the header row.</div>
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
      if (!this.file.parsed) {
        this.columns.status = 'READY'
        this.columns.error = null

        this.columns.value.id = null
        this.columns.value.datetime = null
        this.columns.value.latitude = null
        this.columns.value.longitude = null
        return
      }

      const fields = this.file.parsed.meta.fields

      if (this.columns.status === 'READY') {
        if (this.file.parsed.meta.fields.includes('tag-local-identifier')) {
          this.columns.value.id = 'tag-local-identifier'
        }
        if (this.file.parsed.meta.fields.includes('timestamp')) {
          this.columns.value.datetime = 'timestamp'
        } else if (this.file.parsed.meta.fields.includes('datetime')) {
          this.columns.value.datetime = 'datetime'
        }
        if (this.file.parsed.meta.fields.includes('location-lat')) {
          this.columns.value.latitude = 'location-lat'
        } else if (this.file.parsed.meta.fields.includes('latitude')) {
          this.columns.value.latitude = 'latitude'
        }
        if (this.file.parsed.meta.fields.includes('location-long')) {
          this.columns.value.longitude = 'location-long'
        } else if (this.file.parsed.meta.fields.includes('longitude')) {
          this.columns.value.longitude = 'longitude'
        }
        return
      }

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
      this.resetVariables()
    },
    validateColumns () {
      // console.log('validateColumns')

      // skip validation if project is new and form has never been submitted
      if (this.columns.status === 'READY') return true

      if (!this.file.parsed) {
        return Promise.resolve(
          this.setError('columns', `
            <div class="body-1 font-weight-bold">File Not Found</div>
            <div>Please return to the first step and load a file.</div>
          `)
        )
      }

      // check that form is valid
      this.$v.columns.value.$touch()
      if (this.$v.columns.value.$invalid) {
        return Promise.resolve(
          this.setError('columns')
        )
      }

      // validate each column
      return validateDatasetColumns(this.file.parsed.data, this.columns.value)
        .then(() => {
          this.columns.status = 'SUCCESS'
          this.resetVariables()
          return true
        })
        .catch((e) => {
          let valueMessage = ''
          if (e.details && e.details.length > 0) {
            const path = e.details[0].path
            const value = this.file.parsed.data[path[0]][path[1]]
            valueMessage = ` (found value "${value}")`
          }
          return this.setError('columns', `
            <div class="body-1 font-weight-bold">Failed to validate primary variable columns</div>
            <div class="font-weight-bold mb-2">Reason: ${e.message || e}${valueMessage}</div>
            <div class="my-2">
              Note that the location of the error is specified using the format "[ROW].COLUMN" where the ROWs start at 0.<br>
              E.g. "[2].Latitude" indicates that the error occurred at the 3rd row in the "Latitude" column.
            </div>
            <div class="mt-2">
              Please fix the error in the file, and return to the previous step to reload it.
            </div>
          `)
        })
    },
    prevColumns () {
      this.step -= 1
    },
    nextColumns () {
      this.columns.status = 'PENDING'
      this.validateColumns()
        .then((isValid) => {
          if (isValid) this.step += 1
        })
        .catch((e) => {
          console.log(e)
          return this.setError('columns', `
            <div class="body-1 font-weight-bold">Unknown Error Occurred</div>
            <div class="mt-2"> class="mt-2"${e.message || e}</div>
          `)
        })
    },
    // Step 3: Variables
    resetVariables () {
      if (!this.file.parsed) {
        this.variables.status = 'READY'
        this.variables.error = null
        // this.variable.status = 'READY'
        this.variable.error = null
        this.variables.value = []
        return
      }

      const additionalFields = this.file.parsed.meta.fields
        .filter(d => !Object.values(this.columns.value).includes(d))

      if (additionalFields.length === 0) {
        this.variables.value = []
        return
      }

      const newValue = additionalFields.map(key => {
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
          valid: true,
          skip: false
        }

        const value = this.file.parsed.data[0][variable.id]
        if (isNaN(+value) || !isFinite(+value)) {
          variable.type = 'discrete'
        } else {
          variable.type = 'continuous'
          variable.size = true
        }

        return variable
      })

      this.variables.value = newValue
      this.variables.value.forEach(this.validateVariable)
      this.selectVariableIndex(0)
      this.validateVariables()
      this.resetAggregation()
    },
    validateVariables () {
      // console.log('validateVariables()')
      if (this.variables.status === 'READY') return true

      if (!this.file.parsed) {
        return this.setError('variables', `
          <div class="body-1 font-weight-bold">File Not Found</div>
          <div>Please return to the first step and load a file.</div>
        `)
      }
      // console.log('validateVariables(go)')
      return new Promise((resolve, reject) => {
        for (let i = 0; i < this.variables.value.length; i++) {
          const variable = this.variables.value[i]
          this.validateVariable(variable)
          if (!variable.valid) {
            this.selectVariableIndex(i)
            return resolve(this.setError('variables', `
              <div class="font-weight-bold">"${variable.id}" is not valid</div>
            `))
          }
        }

        this.variables.status = 'SUCCESS'
        return resolve(true)
      })
    },
    prevVariables () {
      this.step -= 1
    },
    nextVariables () {
      this.variables.status = 'PENDING'
      this.validateVariables()
        .then((isValid) => {
          if (isValid) this.step += 1
        })
        .catch((e) => {
          console.log(e)
          return this.setError('variables', `
            <div class="body-1 font-weight-bold">Unknown Error Occurred</div>
            <div class="mt-2"> class="mt-2"${e.message || e}</div>
          `)
        })
    },
    // Step 3a: Variable
    selectVariableIndex (index) {
      this.variables.error = null

      if (this.variableIndex !== index) {
        this.variableIndex = index
      }

      this.$v.variable.value.$reset()

      if (isNaN(index)) {
        this.variable.value = null
        return
      }

      this.variable.value = this.variables.value[this.variableIndex]
    },
    validateVariable (variable) {
      this.variables.error = null

      variable.valid = true
      variable.error = null

      if (variable.skip) return

      if (this.variable.value === variable) {
        this.$v.variable.value.$touch()
        if (this.$v.variable.value.$invalid) {
          variable.valid = false
        }
      }

      if (!variable.name.trim() || variable.name.length > 50) {
        variable.valid = false
      }

      if (variable.type === 'discrete') {
        const domain = [...new Set(this.file.parsed.data.map(d => d[variable.id]))]
        if (domain.length > 100) {
          variable.valid = false
          variable.error = `
            <div class="font-weight-bold">Invalid Discrete Variable</div>
            <div class="body-2 mb-2">A discrete variable cannot have more than 100 unique values (found ${domain.length.toLocaleString()}).</div>
            <div class="body-2 mt-2">Exclude this variable, or modify the dataset file and return to step 1 to reload the CSV file.</div>
          `
        }
        if (variable.outline && domain.length !== 2) {
          variable.valid = false
          variable.error = `
            <div class="font-weight-bold">Invalid Outline Option</div>
            <div class="body-2 my-2">A variable can only be an Outline option if it has exactly 2 unique values (found ${domain.length}).</div>
            <div class="body-2">Unselect the Outline option and try again, or modify the dataset file.</div>
          `
        }
        variable.size = false
      } else if (variable.type === 'continuous') {
        variable.outline = false
      }
    },
    // Step 4: Aggregation
    resetAggregation () {
      if (!this.file.parsed) {
        this.aggregation.status = 'READY'
        this.aggregation.error = null
        this.aggregation.value = 'none'
        return
      }

      this.validateAggregation()
    },
    validateAggregation () {
      if (this.aggregation.status === 'READY') return true

      if (!this.file.parsed) {
        return this.setError('aggregation', `
          <div class="body-1 font-weight-bold">File Not Found</div>
          <div>Please return to the first step and load a file.</div>
        `)
      }

      return new Promise((resolve, reject) => {
        this.aggregation.status = 'SUCCESS'
        const n = this.file.parsed.data.length
        if (n > this.aggregation.maxRows) {
          if (this.aggregation.value === 'none' || !this.aggregation.value) {
            return resolve(this.setError('aggregation', `
              <div class="body-1 font-weight-bold">Aggregation Required</div>
              <div>Datasets with more than 20,000 rows must be aggregated to daily timesteps. Please select an option above.</div>
            `))
          }
        }
        return resolve(true)
      })
    },
    prevAggregation () {
      this.step -= 1
    },
    nextAggregation () {
      this.aggregation.status = 'PENDING'
      this.validateAggregation()
        .then((isValid) => {
          if (isValid) this.step += 1
        })
        .catch((e) => {
          console.log(e)
          return this.setError('aggregation', `
            <div class="body-1 font-weight-bold">Unknown Error Occurred</div>
            <div class="mt-2">${e.message || e}</div>
          `)
        })
    }
  }
}
</script>

<style>
.v-stepper__step.v-stepper__step--active.v-stepper__step--error.error--text > .v-stepper__label {
  text-shadow: 0px 0px 0px #ff5252 !important;
}
</style>
