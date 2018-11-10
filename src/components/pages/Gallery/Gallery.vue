<template>
  <div class="full" ref="full">
    <Renderer
      ref="renderer"
      :size="size"
      @renderer="(v) => { renderer = v }"
    >
    </Renderer>

    <div class="full touch-surface">
      <h1 class="center-text">
        Gallery
      </h1>
    </div>

    <PerspectiveCamera
      :fov="75"
      :aspect="size.aspect"
      :near="1"
      :far="1000"
      :position="camPos"
      @camera="(v) => { camera = v; }"
    />

    <Scene @scene="(v) => { scene = v }">
      <!--
        :px="pick.x * 0.05"
        :py="pick.y * 0.05"
        :pz="pick.z * 0.05"
      -->

      <PicsTable
        :circle="circle"
        :pick="pick"
        :isPicking="hands[0] ? hands[0].pinchStrength > 0.88 : false"
        :mx="hands[0] ? hands[0].palmPosCalibrated[0] * 2.5 : 0.0"
        :my="hands[0] ? hands[0].palmPosCalibrated[1] * 2.5 : 0.0"
        :pinch="hands[0] ? hands[0].pinchStrength : 0.0"
      >
      </PicsTable>

      <!-- <Object3D
        :sx="50.0"
        :sy="50.0"
        :sz="50.0"
      >
        <BgWavyBox />
      </Object3D> -->

      <Object3D
        :sx="2.5"
        :sy="2.5"
        :sz="2.5"

        :px="hands[0] ? hands[0].palmPosCalibrated[0] * 2.5 : 0"
        :py="hands[0] ? hands[0].palmPosCalibrated[1] * 2.5: 0"
        :pz="hands[0] ? hands[0].palmPosCalibrated[2] * 0.0 : 0"

        v-if="hands && hands[0]"
        :visible="hands[0] ? hands[0].activate : false"
      >
        <Mouse
          :intensity="hands[0] ? hands[0].pinchStrength - 0.25 : 0"
        />
      </Object3D>

    </Scene>

  </div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'
import * as THREE from 'three'

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

import BgWavyBox from '@/components/pages/Gallery/UIs/BgWavyBox/BgWavyBox.vue'
import Mouse from '@/components/pages/Gallery/UIs/Mouse/Mouse.vue'
import PicsTable from '@/components/pages/Gallery/UIs/PicsTable/PicsTable.vue'
import * as Leaper from '@/components/pages/LeapMotion/Leap.js'

export default {
  components: {
    ...Bundle,
    BgWavyBox,
    Mouse,
    PicsTable
  },
  computed: {
  },
  methods: {
    setupComposer () {
      var dpi = 1.0

      let composer = this.composer = new THREE.EffectComposer(this.renderer)
      composer.setSize(this.size.width * dpi, this.size.height * dpi)
      window.addEventListener('resize', () => {
        this.composerResizer()
      }, false)
      this.composerResizer = () => {
        composer.setSize(this.size.width * dpi, this.size.height * dpi)
      }
      this.$nextTick(this.composerResizer)

      let renderBG = new THREE.RenderPass(this.scene, this.camera)
      let bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(this.size.width * dpi, this.size.height * dpi), 1.5, 0.4, 0.85)
      bloomPass.renderToScreen = true

      // bloomPass.threshold = Number(0.0001)
      // bloomPass.strength = Number(3.5)
      // bloomPass.radius = Number(1.0)

      composer.addPass(renderBG)
      composer.addPass(bloomPass)

      this.scene.background = new THREE.Color('#99c5c7')
    },
    setupSize () {
      var resizer = this.resizer = () => {
        this.$nextTick(() => {
          var rect = this.$refs.full.getBoundingClientRect()
          this.size = {
            width: rect.width,
            height: rect.height,
            aspect: rect.width / rect.height
          }
        })
      }
      window.addEventListener('resize', resizer.bind(this))
      resizer()
    },
    renderWebGL () {
      let useBloom = true
      if (useBloom && this.scene && this.camera && this.renderer && this.composer) {
        this.composer.render()
      } else if (this.scene && this.camera && this.renderer) {
        this.renderer.render(this.scene, this.camera)
      }
    }
  },
  data () {
    let leaperAPI = Leaper.setup({
      $forceUpdate: () => {
        this.$forceUpdate()
      }
    })

    return {
      ...leaperAPI,

      resizer () {},
      PI: Math.PI,

      size: {
        width: window.innerWidth,
        height: window.innerHeight,
        aspect: window.innerWidth / window.innerHeight
      },
      renderer: false,
      scene: false,
      camera: false,
      camPos: {
        x: 0,
        y: 0,
        z: 180
      }
    }
  },
  created () {

  },
  mounted () {
    this.setupSize()
    this.setupComposer()

    var self = this
    let rAFID = this
    function loop () {
      rAFID = window.requestAnimationFrame(loop)
      self.renderWebGL()
    }
    rAFID = window.requestAnimationFrame(loop)
    self.clean = () => {
      window.cancelAnimationFrame(rAFID)
    }
  },
  beforeDestroy () {
    this.clean()
  }
}
</script>

<style scoped>
.full{
  width: 100%;
  height: 100%;
}
.touch-surface{
  position: absolute;
  top: 0px;
  left: 0px;
}

.center-text{
  text-align: center;
}

h1, h2{
  color: white;
}

a, a:active, a:visited {
  color: white;
}

</style>
