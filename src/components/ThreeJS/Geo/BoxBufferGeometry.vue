<template>
  <div class="geo-box"></div>
</template>

<script>
import * as THREE from 'three'
export default {
  props: {
    num: {
      default: 50
    }
  },
  data () {
    return {
      geometry: false
    }
  },
  mounted () {
    let n = this.num
    let geometry = new THREE.BoxBufferGeometry(2, 2, 2, n, n, n)
    this.$parent.$emit('geometry', geometry)
  }
}
</script>

<style>

</style>
