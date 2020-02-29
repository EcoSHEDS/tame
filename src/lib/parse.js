import Papa from 'papaparse'

export default (file) => new Promise((resolve, reject) => {
  const download = !(file instanceof File)
  return Papa.parse(file, {
    header: true,
    comments: '#',
    delimiter: ',',
    download,
    skipEmptyLines: 'greedy',
    complete: (results) => resolve(results),
    error: (e) => reject(e)
  })
})
