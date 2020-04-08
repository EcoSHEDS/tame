import Joi from '@hapi/joi'
import * as d3 from 'd3'
import L from 'leaflet'
import moment from 'moment'

import calculateBearing from '@/lib/bearing'

export function validateDatasetColumns (rows, columns) {
  // rows: parsed from csv file, array of objects
  // columns: object defining primary column names
  // returns Promise

  columns = columns || {
    id: 'id',
    datetime: 'datetime',
    latitude: 'latitude',
    longitude: 'longitude'
  }

  const data = rows.map(d => ({
    [columns.id]: d[columns.id],
    [columns.datetime]: d[columns.datetime],
    [columns.latitude]: d[columns.latitude],
    [columns.longitude]: d[columns.longitude]
  }))

  const rowSchema = Joi.object({
    [columns.id]: Joi.string().required(),
    [columns.datetime]: Joi.date().iso().required(),
    [columns.latitude]: Joi.number().min(-90).max(90).unsafe().required(),
    [columns.longitude]: Joi.number().min(-180).max(180).unsafe().required()
  })
  const schema = Joi.array().items(rowSchema).min(1).required()

  return new Promise((resolve, reject) => {
    const { error } = schema.validate(data)

    if (error) return reject(error)

    return resolve(true)
  })
}

function toNext (from, to, columns) {
  if (!to) {
    return {
      $duration: null,
      $distance: null,
      $velocity: null,
      $bearing: null
    }
  }
  const days = (to[columns.datetime] - from[columns.datetime]) / 1000 / 86400
  const meters = L.latLng(from[columns.latitude], from[columns.longitude]).distanceTo([to[columns.latitude], to[columns.longitude]])
  const bearing = calculateBearing(
    [from[columns.latitude], from[columns.longitude]],
    [to[columns.latitude], to[columns.longitude]]
  )

  const velocity = days > 0 ? meters / days : -Infinity

  return {
    $duration: days,
    $distance: meters,
    $velocity: velocity,
    $bearing: bearing
  }
}

export function processDataset (data, columns, variables) {
  const numericVariables = variables.filter(d => d.type === 'continuous').map(d => d.id)

  // parse each row, assign index
  data.forEach((row, index) => {
    row.$index = index
    row.$doy = moment.utc(row[columns.datetime]).dayOfYear()
    row[columns.datetime] = new Date(row[columns.datetime])
    row[columns.latitude] = parseFloat(row[columns.latitude])
    row[columns.longitude] = parseFloat(row[columns.longitude])
    numericVariables.forEach(v => {
      row[v] = parseFloat(row[v])
    })
  })

  const nested = d3.nest()
    .key(d => d[columns.id])
    .sortValues((a, b) => (a[columns.datetime] < b[columns.datetime] ? -1 : a[columns.datetime] > b[columns.datetime] ? 1 : a[columns.datetime] >= b[columns.datetime] ? 0 : NaN))
    .entries(data)

  return nested.map(({ values }, i) => {
    const calculated = values.map((d, i) => ({
      ...d,
      $next: values[i + 1],
      ...toNext(d, values[i + 1], columns)
    }))

    const calculatedTotal = calculated.reduce((p, v) => {
      p.$total_n += 1
      p.$total_distance += isFinite(v.$distance) ? v.$distance : 0
      p.$total_duration += isFinite(v.$duration) ? v.$duration : 0
      return p
    }, {
      $total_n: 0,
      $total_distance: 0,
      $total_duration: 0
    })

    return calculated.map(d => ({
      ...d,
      ...calculatedTotal
    }))
  }).flat()
    .sort((a, b) => d3.ascending(a.$index, b.$index))
}
