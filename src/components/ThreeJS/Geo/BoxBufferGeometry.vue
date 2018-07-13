<template>
  <div class="geo-box"></div>
</template>

<script>
import * as THREE from 'three'
export default {
  data () {
    return {
      geometry: false
    }
  },
  mounted () {
    let geometry = new THREE.BoxBufferGeometry(2, 2, 2, 50, 50, 50)
    this.$parent.$emit('geometry', geometry)
  }
}
</script>

<style>

</style>
