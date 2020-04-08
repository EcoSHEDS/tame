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
    if (redirect) router.push(redirect)
  } else if (state === 'signInRefresh') {
    await getUser(true)
    if (redirect) router.push(redirect)
  } else if (state === 'confirmSignUp') {
    router.push({ name: 'signupConfirm' })
  }
})

function getUser (force) {
  return Auth.currentAuthenticatedUser({ bypassCache: !!force })
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

// initial page load
getUser(true)

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
        width: 800,
        persistent: true
      }
    },
    {
      path: '/projects',
      name: 'listProjects',
      component: ListProjects,
      meta: {
        width: 1200,
        persistent: true
      }
    },
    {
      path: '/new',
      name: 'newProject',
      component: ProjectForm,
      meta: {
        isNew: true,
        persistent: true
      }
    },
    {
      path: '/edit',
      name: 'editProject',
      component: ProjectForm,
      meta: {
        isNew: false,
        persistent: true
      }
    },
    {
      path: '/publish',
      name: 'publishProject',
      component: PublishProject,
      meta: {
        width: 800,
        persistent: true
      }
    },
    {
      path: '/unpublish',
      name: 'unpublishProject',
      component: UnpublishProject,
      meta: {
        width: 800,
        persistent: true
      }
    },
    {
      path: '/project/:id',
      name: 'loadProject',
      component: LoadProject,
      meta: {
        width: 600
      }
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
            width: 600,
            persistent: true
          }
        },
        {
          path: 'login',
          name: 'login',
          component: Login,
          meta: {
            width: 600,
            persistent: true
          }
        },
        {
          path: 'logout',
          name: 'logout',
          component: Logout,
          meta: {
            width: 600,
            persistent: true
          }
        },
        {
          path: 'signup',
          name: 'signup',
          component: Signup,
          meta: {
            width: 600,
            persistent: true
          }
        },
        {
          path: 'confirm',
          name: 'signupConfirm',
          component: SignupConfirm,
          meta: {
            width: 600,
            persistent: true
          }
        },
        {
          path: 'change-password',
          name: 'changePassword',
          component: ChangePassword,
          meta: {
            width: 600,
            persistent: true
          }
        },
        {
          path: 'reset-password',
          name: 'resetPassword',
          component: ResetPassword,
          meta: {
            width: 600,
            persistent: true
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

if (process.env.NODE_ENV === 'development') {
  router.beforeEach((to, from, next) => {
    console.log(`router: ${from.path} -> ${to.path}`)
    next()
  })
}

export default router
