import Vue from 'vue'

const evt = new Vue()

evt.$on('map:render', () => console.log('map:render'))
evt.$on('map:render:filter', () => console.log('map:render:filter'))
evt.$on('map:move', () => console.log('map:move'))
evt.$on('map:zoom', () => console.log('map:zoom'))
evt.$on('zoom', () => console.log('zoom'))

export default evt
