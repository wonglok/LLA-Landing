<template>
  <div>

    <Object3D
      @attach="(v) => { $parent.$emit('add', v) }"
      @detach="(v) => { $parent.$emit('remove', v) }"

      :py="getCurrent()"
    >

      <Object3D :py="getPY() * 0.0">
        <PicsRow :mx="mx" :my="my" :pick="pick" :isActive="isActive(0)" />
      </Object3D>

      <Object3D :py="getPY() * 1.0">
        <PicsRow :mx="mx" :my="my" :pick="pick" :isActive="isActive(1)" />
      </Object3D>

    </Object3D>

  </div>
</template>

<script>
import PicsRow from '@/components/pages/Gallery/UIs/PicsRow/PicsRow.vue'

import Bundle from '@/components/ThreeJS/Bundle.js'
import * as THREE from 'three'
// import * as Leap from '@/components/pages/LeapMotion/Leap.js'

export default {
  props: {
    mx: { default: 0 },
    my: { default: 0 },
    isPicking: {
      default: true
    },
    pick: {}
  },
  components: {
    PicsRow,
    ...Bundle
  },
  data () {
    return {
      pp: {
        x: 0,
        y: 0,
        z: 0
      },
      THREE
    }
  },
  methods: {
    getCurrent () {
      return this.pp.y * 0.03
    },
    getPY () {
      return -(100.0 + 10.0)
    },
    isActive (i) {
      let h = i * this.getPY() + this.getCurrent()
      let current = this.my
      let max = h + 50.0
      let min = h - 50.0

      if (current < max && current > min) {
        return true
      } else {
        return false
      }
    },
    update () {
      // var time = window.performance.now() * 0.001
      if (this.isPicking) {
        // this.pp.x += this.pick.dpx * this.pick.in
        this.pp.y += this.pick.dpy * 1.5 * this.pick.in
        // this.pp.z += this.pick.dpz * this.pick.in
      }

      this.pick.in *= 0.95

      // console.log(this.pp.x, this.pp.y, this.pp.z)
    },
    looper () {
      var self = this
      let rAFID = 0
      function loop () {
        rAFID = window.requestAnimationFrame(loop)
        self.update()
      }
      rAFID = window.requestAnimationFrame(loop)
      self.clean = () => {
        window.cancelAnimationFrame(rAFID)
      }
    }
  },
  mounted () {
    this.looper()
  },
  beforeDestroy () {
    this.clean()
  }
}
</script>

<style>

</style>
