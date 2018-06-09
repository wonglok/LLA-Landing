<template>
<div class="mesh-basic-material"><slot /></div>
</template>

<script>
import * as THREE from 'three'
export default {
  props: {
    texture: {},
    opacity: {
      default: 1
    },
    color: {
      default () {
        return new THREE.Color(Math.random() * 0xffffff)
      }
    }
  },
  watch: {
    texture () {
      this.material.map = this.texture
    },
    opacity () {
      this.material.opacity = this.opacity
    }
  },
  data () {
    return {
      material: false
    }
  },
  created () {
  },
  methods: {
    makeMaterial (options) {
      var config = { color: this.color, transparent: true, opacity: this.opacity, ...options }
      this.material = new THREE.MeshBasicMaterial(config)
      this.$parent.$emit('material', this.material)
    }
  },
  mounted () {
    this.makeMaterial({ map: this.texture })
    this.$on('texture', ({ texture }) => {
      this.makeMaterial({ map: texture })
    })
  }
}
</script>

<style>

</style>
