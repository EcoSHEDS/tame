import Joi from 'joi'
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
    [columns.id]: Joi.string(),
    [columns.datetime]: [Joi.string().valid(''), Joi.date().iso()],
    [columns.latitude]: [Joi.string().valid(''), Joi.number().min(-90).max(90).unsafe()],
    [columns.longitude]: [Joi.string().valid(''), Joi.number().min(-360).max(360).unsafe()]
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

export function processDataset (data, columns, variables, aggregation) {
  const numericVariables = variables.filter(d => d.type === 'continuous').map(d => d.id)

  // parse each row, assign index
  data.forEach((row) => {
    row[columns.datetime] = moment.utc(row[columns.datetime]).toDate()
    row[columns.latitude] = parseFloat(row[columns.latitude])
    row[columns.longitude] = parseFloat(row[columns.longitude])
    numericVariables.forEach(v => {
      row[v] = parseFloat(row[v])
    })
  })

  // filter out missing primary variables
  data = data.filter(row => {
    return row[columns.id].trim().length >= 1 &&
      !isNaN(row[columns.datetime]) &&
      !isNaN(row[columns.latitude]) &&
      row[columns.latitude] >= -90 &&
      row[columns.latitude] <= 90 &&
      !isNaN(row[columns.longitude]) &&
      row[columns.longitude] >= -360 &&
      row[columns.longitude] <= 360
  })

  // assign derived variables
  data.forEach((row, index) => {
    row.$index = index
    row.$doy = moment.utc(row[columns.datetime]).dayOfYear()
  })

  const nested = d3.nest()
    .key(d => d[columns.id])
    .sortValues((a, b) => d3.ascending(a[columns.datetime], b[columns.datetime]))
    .entries(data)

  const preAggregated = nested.map(({ values }, i) => {
    values = values.map((d, i) => ({
      ...d,
      ...toNext(d, values[i + 1], columns)
    }))

    const totals = values.reduce((p, v) => {
      p.$total_n += 1
      p.$total_distance += isFinite(v.$distance) ? v.$distance : 0
      p.$total_duration += isFinite(v.$duration) ? v.$duration : 0
      return p
    }, {
      $total_n: 0,
      $total_distance: 0,
      $total_duration: 0
    })

    values = values.map(d => ({
      ...d,
      ...totals
    }))

    values.forEach((d, i) => {
      d.$next = values[i + 1] ? Object.assign({}, values[i + 1]) : undefined
    })

    return values
  }).flat()
    .sort((a, b) => d3.ascending(a.$index, b.$index))

  if (!aggregation || aggregation === 'none') return preAggregated

  const aggregated = aggregateDataset(preAggregated, columns, aggregation)

  return processDataset(aggregated, columns, variables)
}

export function aggregateDataset (values, columns, aggregation) {
  if (!aggregation || aggregation === 'none') return values

  const nested = d3.nest()
    .key(d => d[columns.id])
    .key(d => moment.utc(d[columns.datetime]).startOf('day').format('YYYY-MM-DD'))

  if (aggregation === 'firstDay') {
    nested.sortValues((a, b) => d3.ascending(a[columns.datetime], b[columns.datetime]))
  } else if (aggregation === 'maxDistance') {
    nested.sortValues((a, b) => d3.descending(a.$distance, b.$distance))
  } else {
    throw new Error('Invalid aggregation method')
  }

  return nested.entries(values).map(d => d.values.map(d => d.values[0])).flat()
}
