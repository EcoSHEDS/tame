const AWS = require('aws-sdk')

const dynamodb = new AWS.DynamoDB({
  region: process.env.REGION || 'us-east-1',
  apiVersion: '2012-08-10'
})

const TABLE = process.env.TABLE_NAME

console.log(`connecting to table: ${TABLE}`)

exports.getProjects = () => {
  return dynamodb.scan({
    TableName: TABLE
  }).promise()
    .then(data => {
      return data.Items.map(AWS.DynamoDB.Converter.unmarshall)
    })
}

exports.getProjectById = (id) => {
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
  const now = (new Date()).toISOString()
  project.updatedAt = now
  return dynamodb.putItem({
    TableName: TABLE,
    Item: AWS.DynamoDB.Converter.marshall(project)
  }).promise()
    .then(() => project)
}

exports.deleteProject = (project) => {
  return dynamodb.deleteItem({
    TableName: TABLE,
    Key: {
      id: {
        S: project.id
      }
    }
  }).promise()
}
