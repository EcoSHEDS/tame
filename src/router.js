import Vue from 'vue'
import Router from 'vue-router'
import { AmplifyEventBus } from 'aws-amplify-vue'
import { Auth } from 'aws-amplify'

import store from './store'

import Home from './views/Home.vue'
import Welcome from './views/Welcome.vue'
import ListProjects from './views/ListProjects.vue'
import ProjectForm from './views/ProjectForm.vue'
import LoadProject from './views/LoadProject.vue'
import UnpublishProject from './views/UnpublishProject.vue'
import PublishProject from './views/PublishProject.vue'

import AuthView from './views/auth/Auth.vue'
import Account from './views/auth/Account.vue'
import Login from './views/auth/Login.vue'
import Signup from './views/auth/Signup.vue'
import SignupConfirm from './views/auth/SignupConfirm.vue'
import Logout from './views/auth/Logout.vue'
import ChangePassword from './views/auth/ChangePassword.vue'
import ResetPassword from './views/auth/ResetPassword.vue'

import NotFound from './views/NotFound.vue'

Vue.use(Router)

AmplifyEventBus.$on('authState', async ({ state, redirect }) => {
  if (state === 'signedOut') {
    store.dispatch('setUser', null)
    router.push(redirect || { name: 'logout' })
  } else if (state === 'signIn') {
    await getUser()
    router.push(redirect || { name: 'home' })
  } else if (state === 'confirmSignUp') {
    router.push({ name: 'signupConfirm' })
  }
})

function getUser () {
  return Auth.currentAuthenticatedUser()
    .then((data) => {
      if (data && data.signInUserSession) {
        return store.dispatch('setUser', data)
      }
    }).catch((e) => {
      if (e.code && e.code === 'UserNotConfirmedException') {
        AmplifyEventBus.$emit('authState', { state: 'confirmSignUp' })
      }
      store.dispatch('setUser', null)
      return null
    })
}

getUser()

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        width: 1000
      }
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: Welcome,
      meta: {
        width: 800
      }
    },
    {
      path: '/projects',
      name: 'listProjects',
      component: ListProjects
    },
    {
      path: '/new',
      name: 'newProject',
      component: ProjectForm,
      meta: {
        isNew: true
      }
    },
    {
      path: '/edit',
      name: 'editProject',
      component: ProjectForm,
      meta: {
        isNew: false
      }
    },
    {
      path: '/publish',
      name: 'publishProject',
      component: PublishProject,
      meta: {
        width: 800
      }
    },
    {
      path: '/unpublish',
      name: 'unpublishProject',
      component: UnpublishProject,
      meta: {
        width: 800
      }
    },
    {
      path: '/project/:id',
      name: 'loadProject',
      component: LoadProject
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
      redirect: { name: 'login' },
      children: [
        {
          path: 'account',
          name: 'account',
          component: Account,
          meta: {
            width: 600
          }
        },
        {
          path: 'login',
          name: 'login',
          component: Login,
          meta: {
            width: 600
          }
        },
        {
          path: 'logout',
          name: 'logout',
          component: Logout,
          meta: {
            width: 600
          }
        },
        {
          path: 'signup',
          name: 'signup',
          component: Signup,
          meta: {
            width: 600
          }
        },
        {
          path: 'signup-confirm',
          name: 'signupConfirm',
          component: SignupConfirm,
          meta: {
            width: 600
          }
        },
        {
          path: 'change-password',
          name: 'changePassword',
          component: ChangePassword,
          meta: {
            width: 600
          }
        },
        {
          path: 'reset-password',
          name: 'resetPassword',
          component: ResetPassword,
          meta: {
            width: 600
          }
        }
      ]
    },
    {
      path: '*',
      name: 'notfound',
      component: NotFound
    }
  ]
})

router.beforeEach((to, from, next) => {
  console.log(`routing ${from.path} -> ${to.path}`)
  next()
})
export default router
