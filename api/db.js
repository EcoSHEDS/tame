const AWS = require('aws-sdk')

const REGION = process.env.REGION
const TABLE = process.env.TABLE_NAME

const dynamodb = new AWS.DynamoDB({
  region: REGION,
  apiVersion: '2012-08-10'
})

console.log(`database table: ${TABLE} (${REGION})`)

exports.getProjects = () => {
  return dynamodb.scan({
    TableName: TABLE
  }).promise()
    .then(data => {
      return data.Items.map(AWS.DynamoDB.Converter.unmarshall)
    })
}

exports.getProjectById = (id) => {
  console.log(`getProjectById(${id})`)
  return dynamodb.query({
    TableName: TABLE,
    KeyConditionExpression: 'id =:id',
    ExpressionAttributeValues: {
      ':id': { S: id }
    }
  }).promise()
    .then(data => data.Items.map(AWS.DynamoDB.Converter.unmarshall))
    .then(items => items.length > 0 ? items[0] : null)
}

exports.createProject = (project) => {
  console.log(`createProject(${project.id})`)

  const now = (new Date()).toISOString()
  project.createdAt = now
  project.updatedAt = now

  return exports.getProjectById(project.id)
    .then((existingProject) => {
      if (existingProject) {
        throw new Error('Project ID already in use')
      }
    })
    .then(() => dynamodb.putItem({
      TableName: TABLE,
      Item: AWS.DynamoDB.Converter.marshall(project)
    }).promise())
    .then(() => project)
}

exports.updateProject = (project) => {
  console.log(`updateProject(${project.id})`)

  project.updatedAt = (new Date()).toISOString()

  return dynamodb.putItem({
    TableName: TABLE,
    Item: AWS.DynamoDB.Converter.marshall(project)
  }).promise()
    .then(() => project)
}

exports.deleteProject = (project) => {
  console.log(`deleteProject(${project.id})`)

  return dynamodb.deleteItem({
    TableName: TABLE,
    Key: {
      id: {
        S: project.id
      }
    }
  }).promise()
}
