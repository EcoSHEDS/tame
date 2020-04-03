/* eslint no-unused-expressions: "off" */

import fs from 'fs'
import Papa from 'papaparse'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import { validateDatasetColumns } from '../../src/lib/datasetValidators'

chai.use(chaiAsPromised)
const expect = chai.expect

function validateCsvFile (filepath) {
  const content = fs.readFileSync(`./tests/files/${filepath}`, { encoding: 'utf8' })
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      comments: '#',
      delimiter: ',',
      skipEmptyLines: 'greedy',
      complete: (results) => resolve(validateDatasetColumns(results.data)),
      error: (e) => reject(e)
    })
  })
}

describe('datasetValidators', () => {
  describe('validateDatasetColumns()', () => {
    it('should reject with no data', () => {
      return expect(validateDatasetColumns([])).to.eventually.be.rejected
    })
    it('should resolve with one row', () => {
      return expect(validateDatasetColumns([{ id: '1', datetime: '2020-04-02', latitude: 42, longitude: -72 }])).to.eventually.be.true
    })
    describe('Test Files', () => {
      const resolvedFiles = [
        'columns/base.csv'
      ]
      resolvedFiles.forEach(filepath => {
        it(`${filepath} should be resolved`, () => {
          return expect(validateCsvFile(filepath)).to.eventually.be.true
        })
      })

      const rejectedFiles = [
        'columns/id-blank.csv',
        'columns/latitude-blank.csv',
        'columns/latitude-string.csv',
        'columns/latitude-range.csv',
        'columns/longitude-blank.csv',
        'columns/longitude-string.csv',
        'columns/timestamp-blank.csv',
        'columns/timestamp-format.csv'
      ]
      rejectedFiles.forEach(filepath => {
        it(`${filepath} should be rejected`, () => {
          return expect(validateCsvFile(filepath)).to.eventually.be.rejected
        })
      })
    })
  })
})
