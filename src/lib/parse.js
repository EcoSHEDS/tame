import Papa from 'papaparse'

export default (file) => new Promise((resolve, reject) => {
  const value = file.local || file.location || null
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
