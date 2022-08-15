function deg2rad (x) {
  // convert degrees to radians
  return (x / 360) * 2 * Math.PI
}

export default function (x, y) {
  // computes bearing (degN) between two points: x and y
  // x: [lat, lon]
  // y: [lat, lon]
  // https://www.igismap.com/formula-to-find-bearing-or-heading-angle-between-two-points-latitude-longitude/
  // console.log('bearing', x, y)
  const [x1, x2] = x.map(deg2rad)
  const [y1, y2] = y.map(deg2rad)
  const dL = y2 - x2
  const X = Math.cos(y1) * Math.sin(dL)
  const Y = Math.cos(x1) * Math.sin(y1) - Math.sin(x1) * Math.cos(y1) * Math.cos(dL)
  const b = Math.atan2(X, Y) / (Math.PI) * 180
  return b < 0 ? b + 360 : b
}
