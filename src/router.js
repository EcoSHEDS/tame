import Vue from 'vue'
import Router from 'vue-router'

import Home from './views/Home.vue'
import About from './views/About.vue'
import Login from './views/Login.vue'
import SignUp from './views/SignUp.vue'
import Project from './views/Project.vue'
import Projects from './views/Projects.vue'
import NotFound from './views/NotFound.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUp
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects
    },
    {
      path: '/project/:id',
      name: 'project',
      component: Project
    },
    {
      path: '*',
      name: 'notfound',
      component: NotFound
    }
  ]
})

router.beforeEach((to, from, next) => {
  console.log('router', to.path, from.path)
  next()
})
export default router
