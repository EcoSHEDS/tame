import Papa from 'papaparse'

export default (file) => new Promise((resolve, reject) => {
  let value
  if (file.local) {
    value = file.local
  } else if (file.s3) {
    if (process.env.VUE_APP_DATA_URL) {
      value = `${process.env.VUE_APP_DATA_URL}/${file.s3.key}`
    } else {
      value = file.s3.location
    }
  } else {
    return reject(new Error('Project file not found'))
  }
  return Papa.parse(value, {
    header: true,
    comments: '#',
    delimiter: ',',
    download: !(value instanceof File),
    skipEmptyLines: 'greedy',
    complete: (results) => resolve(results),
    error: (e) => reject(e)
  })
})
