<template>
<div>
  <!-- Display -->

  <!-- <Mesh
    v-if="outputTexture"
    @attach="(v) => { $parent.$emit('add', v) }"
    @detach="(v) => { $parent.$emit('remove', v) }"
  >
    <PlaneBufferGeometry :width="viewport.width" :height="viewport.height" :nx="5" :ny="5"></PlaneBufferGeometry>
    <MeshBasicMaterial :color="0xffffff" :texture="outputTexture"></MeshBasicMaterial>
  </Mesh> -->

  <!-- Content -->
  <RenderTarget
    :width="res.width"
    :height="res.height"
    @rtt="(v) => { rtt = v }"
  />

  <Scene v-if="rtt.texture" @scene="(v) => { sceneRTT = v; setup() }">

    <VectorField
      v-if="renderer && cameraRTT && ori"
      :orientation="ori"
      :camera="cameraRTT"
      :renderer="renderer"
    />

  </Scene>
  <PerspectiveCamera
    :fov="75"
    :aspect="res.width / res.height"
    :near="1"
    :far="10000"
    :position="{ x: 0, y: 0, z: 28 }"
    @camera="(v) => { cameraRTT = v }"
  />


</div>
</template>

<script>
// import { DomToucher } from '@/components/Shared/Utils.js'
// import { DomToucher, fullScreener } from '@/components/shared/tools.js'
// import Text3DComp from '@/components/pages/Hello/Elements/Text/Text3DComp.vue'
import Bundle from '@/components/ThreeJS/Bundle.js'
/* eslint-disable */
import * as TWEEN from '@tweenjs/tween.js'
import * as THREE from 'three'
/* eslint-enable */

import VectorField from '@/components/pages/Hello/CustomAnimation/VectorField/VectorField.vue'

/* eslint-disable */
/*
https://threejs.org/examples/js/postprocessing/EffectComposer.js
https://threejs.org/examples/js/postprocessing/RenderPass.js
https://threejs.org/examples/js/postprocessing/MaskPass.js
https://threejs.org/examples/js/postprocessing/ShaderPass.js
https://threejs.org/examples/js/shaders/CopyShader.js
https://threejs.org/examples/js/shaders/FXAAShader.js
https://threejs.org/examples/js/shaders/ConvolutionShader.js
https://threejs.org/examples/js/shaders/LuminosityHighPassShader.js
https://threejs.org/examples/js/postprocessing/UnrealBloomPass.js
*/
import 'imports-loader?THREE=three!three/examples/js/postprocessing/EffectComposer.js'
import 'imports-loader?THREE=three!three/examples/js/postprocessing/RenderPass.js'
import 'imports-loader?THREE=three!three/examples/js/postprocessing/MaskPass.js'
import 'imports-loader?THREE=three!three/examples/js/postprocessing/ShaderPass.js'
import 'imports-loader?THREE=three!three/examples/js/shaders/CopyShader.js'
import 'imports-loader?THREE=three!three/examples/js/shaders/FXAAShader.js'
import 'imports-loader?THREE=three!three/examples/js/shaders/ConvolutionShader.js'
import 'imports-loader?THREE=three!three/examples/js/shaders/LuminosityHighPassShader.js'
import 'imports-loader?THREE=three!three/examples/js/postprocessing/UnrealBloomPass.js'
/* eslint-enable */

export default {
  components: {
    ...Bundle,
    VectorField// ,
    // Text3DComp
  },
  props: {
    renderer: {}
  },
  data () {
    return {
      outputTexture: false,
      composer: false,
      ori: false,
      fs: false,
      layoutFn () {},
      viewport: {
        width: 10,
        height: 10
      },
      res: {
        width: 512,
        height: 512
      },

      // fullScreener,
      // scroller: false,
      sceneRTT: false,
      rtt: false,
      rAFID: 0,
      camearRTT: false
    }
  },
  computed: {
  },
  created () {
  },
  methods: {
    runWebGL () {
      if (this.renderer && this.cameraRTT && this.sceneRTT && this.composer && this.rtt) {
        this.composer.render()
      }
      //  else if (this.renderer && this.cameraRTT && this.sceneRTT && this.rtt) {
      // }
    },
    setupOri () {
      var ori = this.ori = {
        sx: 0,
        sy: 0,
        dx: 0,
        dy: 0,
        x: 0,
        y: 0,
        xx: 0,
        yy: 0
      }
      function handleOrientation (event) {
        var x = event.beta - 45// In degree in the range [-180,180]
        var y = event.gamma // In degree in the range [-90,90]

        if (window.innerWidth > window.innerHeight) {
          var t = x
          x = y
          y = t
        }

        if (!ori.sx) {
          ori.sx = x
          ori.sy = y
        }

        ori.dx = x - ori.sx
        ori.dy = y - ori.sy

        ori.sx = x
        ori.sy = y

        ori.xx = x / 180
        ori.yy = y / 90
      }

      window.addEventListener('deviceorientation', handleOrientation, false)
    },

    setup () {
      var dpi = 1.0

      let composer = this.composer = new THREE.EffectComposer(this.renderer, this.rtt)
      composer.setSize(this.res.width * dpi, this.res.height * dpi)
      window.addEventListener('resize', () => {
        this.resizer()
      }, false)
      this.resizer = () => {
        composer.setSize(this.res.width * dpi, this.res.height * dpi)
      }
      this.$nextTick(this.resizer)

      let renderBG = new THREE.RenderPass(this.sceneRTT, this.cameraRTT)
      let bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(this.res.width, this.res.height), 1.5, 0.4, 0.85)
      // bloomPass.renderToScreen = true

      bloomPass.threshold = Number(0.0001)
      bloomPass.strength = Number(3.5)
      bloomPass.radius = Number(1.0)

      composer.addPass(renderBG)
      composer.addPass(bloomPass)

      // this.$emit('texture', this.composer.readBuffer.texture)

      this.outputTexture = this.composer.readBuffer.texture

      this.$parent.$emit('textureRTT', this.outputTexture)

      // this.sceneRTT.background = new THREE.Color('hsl(180, 36%, 57%)')
      this.sceneRTT.background = new THREE.Color('#000000')
    },
    attachText ({ mesh, info }) {
    },
    detachText ({ mesh }) {
    }
  },
  mounted () {
    this.setupOri()

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
