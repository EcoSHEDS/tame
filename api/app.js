const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

const db = require('./db')

const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const app = express()

const S3_BUCKET = 'tame-dev-storage'

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

app.use(cors())
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

function deleteS3Object (key) {
  console.log('deleteFile:start', key)
  return new Promise((resolve, reject) => {
    s3.deleteObject({
      Bucket: S3_BUCKET,
      Key: key
    }, (err, data) => {
      console.log('deleteFile:done', err)
      if (err) return reject(err)
      resolve(data)
    })
  })
}

function getUser (req, res, next) {
  if (!req.apiGateway) {
    res.locals.userId = 'test-user'
    return next()
  }
  if (!req.apiGateway.event.requestContext.authorizer.claims.sub) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  res.locals.userId = req.apiGateway.event.requestContext.authorizer.claims.sub
  console.log('userId = ' + res.locals.userId)
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
    return res.status(401).json({ error: 'Unauthorized, user must be project owner'})
  }
  next()
}

app.get('/projects', (req, res, next) => {
  db.getProjects()
    .then(projects => {
      return res.json(projects)
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

  if (project.file) {
    try {
      await deleteS3Object(project.file.key)
    } catch (e) {
      return res.status(500).json({ error: e.message || e.toString() })
    }
  }

  project.file = {
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

app.delete('/projects/:projectId', getProject, getUser, (_, res, next) => {
  return db.deleteProject(res.locals.project)
    .then(() => res.json())
    .catch(e => next(e))
})

app.use((req, res, next) => {
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
