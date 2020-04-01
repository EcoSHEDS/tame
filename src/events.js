import Vue from 'vue'

const evt = new Vue()

if (process.env.NODE_ENV === 'development') {
  const events = [
    'map:render',
    'map:render:filter',
    'map:move',
    'map:zoom',
    'zoom'
  ]
  events.forEach(e => evt.$on(e, () => console.log(e)))
}

export default evt
