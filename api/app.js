const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
// const { S3Client } = require('@aws-sdk/client-s3')
const AWS = require('aws-sdk')
const morgan = require('morgan')

const db = require('./db')

const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

const app = express()

const S3_BUCKET = process.env.S3_BUCKET
console.log(`s3 bucket: ${S3_BUCKET}`)
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  region: process.env.REGION
})

function createPresignedPostPromise (params) {
  return new Promise((resolve, reject) => {
    s3.createPresignedPost(params, (err, data) => {
      if (err) return reject(err)
      return resolve(data)
    })
  })
}

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
  console.log(req.apiGateway.event.requestContext)
  if (!req.apiGateway.event.requestContext.authorizer || !req.apiGateway.event.requestContext.authorizer.claims.sub) {
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

  const key = uuidv4()
  createPresignedPostPromise({
    Bucket: S3_BUCKET,
    Fields: {
      key
    },
    Expires: 60 * 60 * 1 // one hour
  }).then((result) => {
    project.file.s3 = {
      name: project.file.name,
      mimetype: 'text/csv',
      size: project.file.size,
      key,
      bucket: S3_BUCKET,
      location: `https://${S3_BUCKET}.s3.amazonaws.com/${key}`
    }
    return db.createProject(project)
      .then(p => {
        p.presignedUrl = result
        return p
      })
  }).then(project => res.json(project))
    .catch(next)
})

app.get('/projects/:projectId', getProject, (_, res) => {
  return res.json(res.locals.project)
})

app.put('/projects/:projectId', getProject, getUser, isOwner, (req, res, next) => {
  if (req.body.id !== req.params.projectId) {
    return res.status(400).json({ error: 'Project ID cannot be changed' })
  }
  console.log(req.body)

  if (req.query.presigned === 'true') {
    const key = uuidv4()
    const project = req.body
    return createPresignedPostPromise({
      Bucket: S3_BUCKET,
      Fields: {
        key
      },
      Expires: 60 * 60 * 1 // one hour
    }).then((result) => {
      project.file.s3 = {
        name: project.file.name,
        mimetype: 'text/csv',
        size: project.file.size,
        key,
        bucket: S3_BUCKET,
        location: `https://${S3_BUCKET}.s3.amazonaws.com/${key}`
      }
      return db.updateProject(project)
        .then(p => {
          p.presignedUrl = result
          return p
        })
    }).then(project => res.json(project))
      .catch(next)
  } else {
    return db.updateProject(req.body)
      .then((project) => res.json(project))
      .catch(next)
  }
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
