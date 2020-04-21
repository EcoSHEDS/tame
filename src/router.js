import Vue from 'vue'
import Router from 'vue-router'
import { AmplifyEventBus } from 'aws-amplify-vue'
import { Auth } from 'aws-amplify'

import store from './store'

import Home from './views/Home.vue'
import Welcome from './views/Welcome.vue'
import Guide from './views/Guide.vue'

import Projects from './views/Projects.vue'

import RootProject from './views/project/RootProject.vue'
import EditProject from './views/project/EditProject.vue'
import LoadProject from './views/project/LoadProject.vue'
import AboutProject from './views/project/AboutProject.vue'
import DeleteProject from './views/project/DeleteProject.vue'
import SaveProject from './views/project/SaveProject.vue'

import RootAuth from './views/auth/RootAuth.vue'
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
      path: '/guide',
      name: 'guide',
      component: Guide,
      meta: {
        width: 1200,
        persistent: true
      }
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects,
      meta: {
        width: 1200,
        persistent: true
      }
    },
    {
      path: '/projects/:id',
      name: 'loadProject',
      component: LoadProject,
      meta: {
        width: 600
      }
    },
    {
      path: '/project',
      name: 'project',
      component: RootProject,
      redirect: { name: 'new' },
      children: [
        {
          path: 'new',
          name: 'newProject',
          component: EditProject,
          meta: {
            isNew: true,
            persistent: true
          }
        },
        {
          path: 'edit',
          name: 'editProject',
          component: EditProject,
          meta: {
            isNew: false,
            persistent: true
          }
        },
        {
          path: 'save',
          name: 'saveProject',
          component: SaveProject,
          meta: {
            width: 800,
            persistent: true
          }
        },
        {
          path: 'delete',
          name: 'deleteProject',
          component: DeleteProject,
          meta: {
            width: 800,
            persistent: true
          }
        },
        {
          path: 'about',
          name: 'aboutProject',
          component: AboutProject,
          meta: {
            width: 800
          }
        }
      ]
    },
    {
      path: '/auth',
      name: 'auth',
      component: RootAuth,
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
