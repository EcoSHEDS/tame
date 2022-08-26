<script>
// import { optionsMerger, propsBinder } from 'vue2-leaflet/src/utils/utils.js'
// import { propsBinder } from 'vue2-leaflet/src/utils/utils.js'
// import ControlMixin from 'vue2-leaflet/src/mixins/Control.js'
// import Options from 'vue2-leaflet/src/mixins/Options.js'
// import { control } from 'leaflet'
import L from 'leaflet'
import evt from '@/events'

// L.drawLocal.edit.toolbar.buttons.removeDisabled = 'Draw polygon to select multiple barriers'

export default {
  name: 'LControlDraw',
  data () {
    return {
      selectionAreas: []
    }
  },
  beforeDestroy () {
    this.map.removeLayer(this.layer)
    this.map.removeControl(this.control)
    this.map.on('draw:created', this.onCreated)
    this.map.off('draw:deleted', this.onDeleted)
    evt.$off('unselectAll', this.clear)
  },
  computed: {
    map () {
      return this.$parent.mapObject
    }
  },
  mounted () {
    this.control = new L.Control.Draw({
      position: 'topright',
      draw: {
        circle: false,
        circlemarker: false,
        polygon: false,
        polyline: false,
        marker: false
      },
      edit: {
        featureGroup: this.layer,
        edit: false
      }
    })
    this.map.addLayer(this.layer)
    this.map.addControl(this.control)
    this.map.on('draw:created', this.onCreated)
    this.map.on('draw:deleted', this.onDeleted)

    evt.$on('unselectAll', this.clear)
  },
  methods: {
    clear () {
      this.layer.eachLayer(this.layer.removeLayer)
    },
    onCreated ({ layer }) {
      this.layer.addLayer(layer)
      this.onChange()
    },
    onDeleted () {
      this.onChange()
    },
    onChange () {
      this.$emit('change', this.layer.toGeoJSON())
    }
  },
  render () {
    return null
  }
}
</script>
