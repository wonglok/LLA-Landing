<template>
<div>
  <!-- Display -->
  <Scene @scene="(v) => { scene = v }">

    <Mesh
    >
      <PlaneBufferGeometry :width="30" :height="30" :nx="5" :ny="5"></PlaneBufferGeometry>
      <MeshBasicMaterial :color="0xffffff" :texture="rtt.texture"></MeshBasicMaterial>
    </Mesh>

  </Scene>

  <!-- Content -->
  <RenderTarget
    :width="512"
    :height="512"
    @rtt="(v) => { rtt = v }"
  />
  <Scene v-if="rtt.texture" @scene="(v) => { sceneRTT = v; setup() }">

    <Object3D
      :rz="rr.x"
    >
      <Points
      >
        <SphereBufferGeometry></SphereBufferGeometry>
        <MeshBasicMaterial :color="0xffffff"></MeshBasicMaterial>
      </Points>
    </Object3D>

    <Object3D
      :px="6"
      :ry="rr.x"
    >
      <Points
      >
        <SphereBufferGeometry></SphereBufferGeometry>
        <MeshBasicMaterial :color="0xffffff"></MeshBasicMaterial>
      </Points>
    </Object3D>


  </Scene>

  <PerspectiveCamera
    :fov="75"
    :aspect="size.aspect"
    :near="1"
    :far="10000"
    :position="camPos"
    @camera="(v) => { camera = v }"
  />

</div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'
import * as THREE from 'three'

export default {
  components: {
    ...Bundle
  },
  props: {
    renderer: {},
    size: {}
  },
  data () {
    return {
      rr: {
        x: 0
      },
      sceneRTT: false,
      rtt: false,
      rAFID: 0,
      scene: false,
      camear: false,
      camPos: {
        x: 0, y: 0, z: 25
      }
    }
  },
  computed: {
  },
  methods: {
    runWebGL () {
      if (this.renderer && this.camera && this.sceneRTT && this.rtt) {
        this.renderer.render(this.sceneRTT, this.camera, this.rtt)
      }
      if (this.renderer && this.camera && this.scene) {
        this.renderer.render(this.scene, this.camera)
      }
      this.rr.x += 0.1
    },
    setup () {
      this.sceneRTT.background = new THREE.Color('#374967')
    }
  },
  mounted () {
    var rAF = () => {
      this.runWebGL()
      this.rAFID = window.requestAnimationFrame(rAF)
    }
    this.rAFID = window.requestAnimationFrame(rAF)
  }
}
</script>

<style>

</style>
