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

export function processDataset (data, columns, variables, calculated) {
  const numericVariables = variables.filter(d => d.type === 'continuous').map(d => d.id)

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

  const groupByTag = d3.nest()
    .key(d => d[columns.id])
    .sortValues((a, b) => (a[columns.datetime] < b[columns.datetime] ? -1 : a[columns.datetime] > b[columns.datetime] ? 1 : a[columns.datetime] >= b[columns.datetime] ? 0 : NaN))
    .entries(data)

  const mapByIndex = new Map()
  groupByTag.forEach(d => {
    const n = d.values.length

    const calculatedValues = {}

    for (let i = 0; i < (n - 1); i++) {
      const start = d.values[i]
      const end = d.values[i + 1]

      const days = (end[columns.datetime] - start[columns.datetime]) / 1000 / 86400
      const meters = L.latLng(start[columns.latitude], start[columns.longitude]).distanceTo([end[columns.latitude], end[columns.longitude]])
      const bearing = calculateBearing(
        [start[columns.latitude], start[columns.longitude]],
        [end[columns.latitude], end[columns.longitude]]
      )

      const velocity = days > 0 ? meters / days : -Infinity

      calculatedValues[start.$index] = {
        $duration: days,
        $distance: meters,
        $velocity: velocity,
        $bearing: bearing
      }
    }

    calculatedValues[d.values[n - 1].$index] = {
      $duration: -Infinity,
      $distance: -Infinity,
      $velocity: -Infinity,
      $bearing: -Infinity
    }

    const summary = d.values.reduce((p, v) => {
      const distance = calculatedValues[v.$index].$distance
      const duration = calculatedValues[v.$index].$duration
      p.count += 1
      p.distance += isFinite(distance) ? distance : 0
      p.duration += isFinite(duration) ? duration : 0
      return p
    }, {
      count: 0,
      distance: 0,
      duration: 0
    })

    d.values.forEach(d => {
      mapByIndex.set(d.$index, {
        ...calculatedValues[d.$index],
        $total_n: summary.count,
        $total_distance: summary.distance,
        $total_duration: summary.duration
      })
    })
  })

  return data.map(d => ({
    ...d,
    ...mapByIndex.get(d.$index)
  }))
}
