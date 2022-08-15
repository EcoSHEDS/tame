import * as d3 from 'd3'

// https://github.com/d3/d3-scale-chromatic

export const cyclical = [
  'Rainbow',
  'Sinebow'
]

export const sequentialMulti = [
  'Viridis',
  'Inferno',
  'Magma',
  'Plasma',
  'Warm',
  'Cool'
]

export const sequentialMultiColor = [
  'BuGn',
  'BuPu',
  'GnBu',
  'OrRd',
  'PuBuGn',
  'PuBu',
  'PuRd',
  'YlGnBu',
  'YlGn',
  'YlOrBr',
  'YlOrRd'
]

export const sequentialSingle = [
  'Blues',
  'Greens',
  'Greys',
  'Oranges',
  'Purples',
  'Reds'
]

export const diverging = [
  'Spectral',
  'RdYlBu',
  'RdYlGn',
  'RdBu',
  'BrBG',
  'PiYG',
  'PRGn',
  'PuOr',
  'RdGy'
]

export const categorical = [
  'Category10',
  'Accent',
  'Dark2',
  'Paired',
  'Pastel1',
  'Pastel2',
  'Set1',
  'Set2',
  'Set3',
  'Tableau10'
]

export function generateColorScale (type, scheme, invert) {
  if (type === 'continuous') {
    return d3.scaleSequential(d3[`interpolate${scheme}`])
      .domain(invert ? [1, 0] : [0, 1])
  } else {
    let palette
    if (categorical.includes(scheme)) {
      palette = d3[`scheme${scheme}`]
    } else {
      palette = d3[`scheme${scheme}`][9]
    }
    return d3.scaleOrdinal(palette)
  }
}
