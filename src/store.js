import Vue from 'vue'
import Vuex from 'vuex'

import parse from '@/lib/parse'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    project: null,
    usgs: process.env.VUE_APP_USGS === 'true'
  },
  getters: {
    user: state => state.user,
    project: state => state.project,
    isOwner: (state) => {
      if (!state.user || !state.project) return false
      return !state.project.id || state.project.userId === state.user.username
    },
    usgs: state => state.usgs
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

      // if (project.file.parsed) {
      //   commit('SET_PROJECT', project)
      //   return Promise.resolve(project)
      // }

      if (!project.file) {
        return Promise.reject(new Error('Project file not found'))
      }

      return new Promise((resolve, reject) => {
        parse(project.file)
          .then((results) => {
            if (results.errors.length > 0) {
              return reject(new Error(`${results.errors[0].message} (Row ${results.errors[0].row})`))
            }
            project.dataset = Object.freeze(results)
            commit('SET_PROJECT', project)
            return resolve(project)
          })
          .catch(e => reject(e))
      })
    }
  }
})
