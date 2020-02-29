import Vue from 'vue'
import Vuex from 'vuex'
import { Storage } from 'aws-amplify'

import parse from '@/lib/parse'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    project: null
  },
  getters: {
    user: state => state.user,
    project: state => state.project,
    isOwner: (state) => {
      if (!state.user || !state.project) return false
      return !state.project.id || state.project.userId === state.user.username
    }
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

      if (project.file.parsed) {
        commit('SET_PROJECT', project)
        return Promise.resolve(project)
      }

      const file = await Storage.get(project.file.s3.key, {
        level: 'protected',
        identityId: project.file.s3.identityId
      })

      if (!file) {
        return Promise.reject(new Error('Project file not found'))
      }

      return new Promise((resolve, reject) => {
        parse(file)
          .then((results) => {
            if (results.errors.length > 0) {
              return reject(new Error(`${results.errors[0].message} (Row ${results.errors[0].row})`))
            }
            project.file.parsed = Object.freeze(results)
            commit('SET_PROJECT', project)
            return resolve(project)
          })
          .catch(e => reject(e))
      })
    }
  }
})
