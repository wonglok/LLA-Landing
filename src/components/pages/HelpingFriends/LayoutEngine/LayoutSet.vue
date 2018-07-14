<template>
<div>
  <slot ref="slot">
  </slot>
</div>
</template>

<script>
import * as LE from './../LayoutEngine/LayoutEngine.js'

export default {
  props: {
    zPos: {
      default () {
        return 0
      }
    },
    camera: {}
  },
  data () {
    return {
      LE,
      view: false,
      layout: LE.makeLayoutSet()
    }
  },
  created () {
    this.$on('register-layout', (v) => {
      this.layout.register(v)
    })
    this.$on('unregister-layout', (v) => {
      this.layout.unregister(v)
    })

    this.$on('add', (v) => {
      this.$parent.$emit('add', v)
    })
    this.$on('remove', (v) => {
      this.$parent.$emit('remove', v)
    })
  },
  mounted () {
    this.setupResizer()
  },
  methods: {
    setupResizer () {
      var resizer = this.resizer = () => {
        if (!this.camera) { return }
        this.view = LE.FSCalc({ zPos: this.zPos, camera: this.camera })
        console.log(this.view)

        this.$emit('update-deps', {
          view: this.view,
          layout: this.layout
        })

        this.$emit('refresh-all-child-layout')
      }
      window.addEventListener('resize', resizer, false)
      resizer()
      this.$nextTick(resizer)
    }
  }
}
</script>

<style>

</style>
