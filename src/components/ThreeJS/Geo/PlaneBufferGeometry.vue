<template>
  <div class="geo-Plane"></div>
</template>

<script>
import * as THREE from 'three'
export default {
  props: {
    width: {
      default: 5
    },
    height: {
      default: 5
    },
    nx: {
      default: 30
    },
    ny: {
      default: 30
    }
  },
  data () {
    return {
      geometry: false
    }
  },
  watch: {
    width () {
      this.makeGeometry()
    },
    height () {
      this.makeGeometry()
    },
    nx () {
      this.makeGeometry()
    },
    ny () {
      this.makeGeometry()
    }
  },
  methods: {
    makeGeometry () {
      let geometry = new THREE.PlaneBufferGeometry(this.width, this.height, this.nx, this.ny)
      this.$parent.$emit('geometry', geometry)
    }
  },
  mounted () {
    this.makeGeometry()
  }
}
</script>

<style>

</style>
