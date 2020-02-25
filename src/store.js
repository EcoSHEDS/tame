import Vue from 'vue'
import Vuex from 'vuex'
import Papa from 'papaparse'
import { Storage } from 'aws-amplify'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    project: null
  },
  getters: {
    user: state => state.user,
    project: state => state.project
  },
  mutations: {
    SET_USER (state, user) {
      state.user = user
    },
    SET_PROJECT (state, project) {
      state.project = project
    }
  },
  actions: {
    setUser ({ commit }, user) {
      commit('SET_USER', user)
      return user
    },
    async loadProject ({ commit }, project) {
      if (!project) return commit('SET_PROJECT', null)
      let file
      if (project.isLocal) {
        file = project.file
      } else {
        file = await Storage.get(project.file.key, {
          level: 'protected',
          identityId: project.file.identityId
        })
      }
      console.log(file)

      return new Promise((resolve, reject) => {
        if (!project.file) return reject(new Error('Project file not found'))

        Papa.parse(file, {
          header: true,
          comments: '#',
          delimiter: ',',
          download: !project.isLocal,
          skipEmptyLines: 'greedy',
          complete: (results) => {
            // this.file.parsedFile = Object.freeze(results)
            if (results.errors.length > 0) {
              return console.log(`${results.errors[0].message} (Row ${results.errors[0].row})`)
            }
            project.data = Object.freeze(results.data)
            commit('SET_PROJECT', project)
            return resolve(project)
          },
          error: (e) => {
            return reject(e)
          }
        })
      })
    }
  }
})
