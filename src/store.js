import Vue from 'vue'
import Vuex from 'vuex'

import parse from '@/lib/parse'
import { generateColorScale } from '@/lib/colors'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    usgs: process.env.VUE_APP_USGS === 'true',
    user: null,
    project: null,
    colorOptions: {
      type: 'continuous',
      scheme: 'Viridis',
      invert: false
    },
    colorVariable: null,
    colorContinuous: {
      scheme: 'Viridis',
      invert: false
    },
    colorDiscrete: {
      scheme: 'Category10'
    }
  },
  getters: {
    user: state => state.user,
    project: state => state.project,
    isOwner: (state) => {
      if (!state.user || !state.project) return false
      return !state.project.id || state.project.userId === state.user.username
    },
    usgs: state => state.usgs,
    colorOptions: state => state.colorOptions,
    colorVariable: state => state.colorVariable,
    colorContinuous: state => state.colorContinuous,
    colorDiscrete: state => state.colorDiscrete,
    colorScale: state => {
      console.log('store:colorScale')
      if (!state.colorVariable) {
        return () => '#AAAAAA'
      } else if (state.colorVariable.type === 'continuous') {
        const { scheme, invert } = state.colorContinuous
        return generateColorScale('continuous', scheme, invert)
      } else {
        const { scheme } = state.colorDiscrete
        return generateColorScale('discrete', scheme)
      }
    }
  },
  mutations: {
    SET_USER (state, user) {
      state.user = user
    },
    SET_PROJECT (state, project) {
      state.project = project
    },
    SET_COLOR_OPTIONS (state, colorOptions) {
      state.colorOptions = colorOptions
    },
    SET_COLOR_VARIABLE (state, variable) {
      state.colorVariable = variable
    },
    SET_COLOR_CONTINUOUS (state, { scheme, invert }) {
      state.colorContinuous = {
        scheme,
        invert
      }
    },
    SET_COLOR_DISCRETE (state, { scheme }) {
      state.colorDiscrete = {
        scheme
      }
    }
  },
  actions: {
    setUser ({ commit }, user) {
      commit('SET_USER', user)
      return user
    },
    setColorOptions ({ commit }, colorOptions) {
      commit('SET_COLOR_OPTIONS', colorOptions)
      return colorOptions
    },
    setColorVariable ({ commit }, variable) {
      commit('SET_COLOR_VARIABLE', variable)
      return variable
    },
    setColorContinuous ({ commit }, payload) {
      commit('SET_COLOR_CONTINUOUS', payload)
      return payload
    },
    setColorDiscrete ({ commit }, payload) {
      commit('SET_COLOR_DISCRETE', payload)
      return payload
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
