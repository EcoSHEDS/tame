import Vue from 'vue'
import axios from 'axios'

axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:8080'
Vue.prototype.$http = axios
