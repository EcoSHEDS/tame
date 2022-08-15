import Vue from 'vue'
import axios from 'axios'

Vue.prototype.$http = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL
})
