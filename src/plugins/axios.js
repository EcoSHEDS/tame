import Vue from 'vue'
import axios from 'axios'
import store from '../store'

console.log(store.getters.user)

Vue.prototype.$http = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  headers: {
    'x-api-key': process.env.VUE_APP_API_KEY
  }
})
