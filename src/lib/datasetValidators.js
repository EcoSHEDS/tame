import Joi from '@hapi/joi'

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
    [columns.latitude]: Joi.number().min(-90).max(90).required(),
    [columns.longitude]: Joi.number().min(-180).max(180).required()
  })
  const schema = Joi.array().items(rowSchema).min(1).required()

  return new Promise((resolve, reject) => {
    const { error } = schema.validate(data)

    if (error) return reject(error)

    return resolve(true)
  })
}
