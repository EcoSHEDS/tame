const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const db = require('./db')

const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const app = express()
const router = express.Router()

router.use(cors())
router.use(bodyParser.json())
router.use(awsServerlessExpressMiddleware.eventContext())

router.use((req, res, next) => {
  if (req.apiGateway) {
    // console.log(req.apiGateway.event.requestContext.identity)
    // https://janhesters.com/how-to-access-the-user-in-lambda-functions-with-amplify/
    const authProvider = req.apiGateway.event.requestContext.identity.cognitoAuthenticationProvider
    if (authProvider) {
      const IDP_REGEX = /.*\/.*,(.*)\/(.*):CognitoSignIn:(.*)/
      const [, , , userId] = authProvider.match(IDP_REGEX)
      res.locals.userId = userId
    } else {
      res.locals.userId = null
    }
  }
  next()
})

router.get('/projects', (_, res, next) => {
  db.getProjects()
    .then(projects => {
      return res.json(projects)
    })
    .catch(next)
})

router.post('/projects', (req, res, next) => {
  db.createProject(req.body)
    .then(project => res.json(project))
    .catch(next)
})

router.get('/projects/:projectId', attachProject, (_, res) => {
  return res.json(res.locals.project)
})

router.put('/projects/:projectId', attachProject, (req, res, next) => {
  const existingProject = res.locals.project
  const newProject = req.body

  if (existingProject.id !== newProject.id) {
    return res.status(400).json({ error: 'Project ID does not match existing project' })
  } else if (existingProject.userId !== newProject.userId) {
    return res.status(400).json({ error: 'User ID does not match existing project' })
  }

  return db.updateProject(newProject)
    .then((project) => res.json(project))
    .catch(next)
})

router.delete('/projects/:projectId', attachProject, (_, res, next) => {
  return db.deleteProject(res.locals.project)
    .then(() => res.json())
    .catch(e => next(e))
})

function attachProject (req, res, next) {
  db.getProjectById(req.params.projectId)
    .then(project => {
      if (!project) {
        return res.status(404).json({ error: 'Project not found' })
      }
      res.locals.project = project
      next()
    })
    .catch(next)
}

router.use((err, req, res, next) => {
  console.log(err)
  return res.status(500).json({
    error: err.message
  })
})

app.use('/', router)

module.exports = app
