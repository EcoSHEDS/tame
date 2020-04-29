const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const morgan = require('morgan')

const db = require('./db')

const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

const app = express()

const S3_BUCKET = process.env.S3_BUCKET
console.log(`s3 bucket: ${S3_BUCKET}`)

const s3 = new AWS.S3()
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_BUCKET,
    key: function (req, file, cb) {
      cb(null, uuidv4())
    }
  })
})

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.json({ limit: '100mb' }))
app.use(awsServerlessExpressMiddleware.eventContext())

function deleteS3Object (key) {
  console.log(`deleteS3Object(${key})`)
  return new Promise((resolve, reject) => {
    s3.deleteObject({
      Bucket: S3_BUCKET,
      Key: key
    }, (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}

function getUser (req, res, next) {
  // console.log('getUser()')
  if (!req.apiGateway) {
    res.locals.userId = 'test-user'
    return next()
  }
  // console.log(req.apiGateway.event.requestContext)
  if (!req.apiGateway.event.requestContext.authorizer || !req.apiGateway.event.requestContext.authorizer.claims.sub) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  res.locals.userId = req.apiGateway.event.requestContext.authorizer.claims.sub
  // console.log('userId = ' + res.locals.userId)
  next()
}

function getProject (req, res, next) {
  db.getProjectById(req.params.projectId)
    .then(project => {
      if (!project) {
        return res.status(404).json({ error: 'Project not found' })
      }
      res.locals.project = project
      console.log('project.id = ' + res.locals.project.id)
      next()
    })
    .catch(next)
}

function isOwner (req, res, next) {
  const { project, userId } = res.locals
  if (project.userId !== userId) {
    return res.status(401).json({ error: 'Unauthorized, user must be project owner' })
  }
  next()
}

app.get('/projects', (req, res, next) => {
  db.getProjects()
    .then(projects => {
      const publishedProjects = projects.filter(project => project.publish)
      return res.json(publishedProjects)
    })
    .catch(next)
})

app.get('/user-projects', getUser, (req, res, next) => {
  db.getProjects()
    .then(projects => {
      const userProjects = projects.filter(project => project.userId === res.locals.userId)
      return res.json(userProjects)
    })
    .catch(next)
})

app.post('/projects', getUser, (req, res, next) => {
  const project = req.body
  project.userId = res.locals.userId
  db.createProject(project)
    .then(project => res.json(project))
    .catch(next)
})

app.get('/projects/:projectId', getProject, (_, res) => {
  return res.json(res.locals.project)
})

app.put('/projects/:projectId', getProject, getUser, isOwner, (req, res, next) => {
  if (req.body.id !== req.params.projectId) {
    return res.status(400).json({ error: 'Project ID cannot be changed' })
  }

  return db.updateProject(req.body)
    .then((project) => res.json(project))
    .catch(next)
})

app.post('/projects/:projectId/dataset', getProject, getUser, isOwner, upload.single('dataset'), async (req, res, next) => {
  const project = res.locals.project

  if (!req.file) return res.status(400).json({ error: 'Missing file' })

  console.log('uploaded file')
  console.log(req.file)

  if (project.file && project.file.s3) {
    try {
      await deleteS3Object(project.file.s3.key)
    } catch (e) {
      return res.status(500).json({ error: e.message || e.toString() })
    }
  }

  project.file.s3 = {
    name: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    key: req.file.key,
    bucket: req.file.bucket,
    location: req.file.location
  }

  return db.updateProject(project)
    .then(() => res.json(project))
    .catch(next)
})

app.delete('/projects/:projectId', getProject, getUser, isOwner, async (_, res, next) => {
  const project = res.locals.project

  if (project.file && project.file.s3) {
    try {
      await deleteS3Object(project.file.s3.key)
    } catch (e) {
      return res.status(500).json({ error: e.message || e.toString() })
    }
  }

  return db.deleteProject(res.locals.project)
    .then(() => res.json())
    .catch(next)
})

app.use((req, res, next) => {
  console.log('not found')
  return res.status(404).json({
    error: 'Not Found'
  })
})

app.use((err, req, res, next) => {
  console.log(err)
  return res.status(500).json({
    error: err.message
  })
})

module.exports = app
