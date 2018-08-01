<template>
  <div class="full">
    <div class="full toucher" ref="touch-surface">

      <div class="full scroll-container" ref="scroll-container" @scroll="scl.onScroll" v-show="false">
        <div class="scroll-content" ref="scroll-content">

          <pre v-if="false" :key="hand.id" v-for="hand in hands">{{ hand.string }}</pre>
          <!-- <pre :key="pointable.id" v-for="pointable in pointables">{{ pointable.string }}</pre> -->

          <!--
           -->

          <!-- <pre class="white">{{ Relay }}</pre> -->

          <!-- <pre v-if="Relay.internal.state">{{ Relay.internal.state }}</pre>

          <div :key="box.id" v-for="box in boxesData">
            x<input type="text" v-model="box.formulas.px" />
            y<input type="text" v-model="box.formulas.py" />
            z<input type="text" v-model="box.formulas.pz" />
          </div> -->

          <div class="tall">1</div>
          <div class="tall">2</div>
          <div class="tall">3</div>
          <div class="tall">4</div>
          <div class="tall">5</div>
          <div class="tall">6</div>
          <div class="tall">7</div>
          <div class="tall">8</div>
        </div>
      </div>

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

      <!-- <BoxesGroup
        v-if="scl && scl.state && scene && camera"
        :scl="scl"
        :boxesData="boxesData"
        :camera="camera"
      /> -->

      <!-- <keep-alive
        v-if="hand.activate"
        :key="ip" v-for="(hand, ip) in hands"
      >
        <Object3D
          :activate="(o) => {
            o.visible = true
          }"
          :deactivate="(o) => {
            o.visible = false
          }"

          :px="hand.palm[0]"
          :py="hand.palm[1]"
          :pz="hand.palm[2]"

          :rz="(hand.palm[2] - 50) / 100 * 3.14"

          :d-rx="hand.dir[0]"
          :d-ry="hand.dir[1]"
          :d-rz="hand.dir[0]"

          :sx="2.5"
          :sy="2.5"
          :sz="2.5"
        >
          <Box />
        </Object3D>
      </keep-alive> -->

      <Object3D
        :px="0.0"
        :py="100.0"
        :pz="150.0"
      >
        <Wave
          v-if="renderer && hands[0]"
          :mouse="{
            x: hands[0].palm[0],
            y: hands[0].palm[1] - 100.0,
            z: hands[0].palm[2]
          }"

          :renderer="renderer"
        />
      </Object3D>


    </Scene>

  </div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'
import * as THREE from 'three'
import * as Scroller from '@/components/shared/DomScroller/DomScroller.js'

import * as Relay from '@/components/shared/RelayConnector/relay.js'

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

import BoxesGroup from '@/components/pages/HelpingFriends/Box/BoxesGroup.vue'
import Box from '@/components/pages/HelpingFriends/Box/Box.vue'

// import VectorField from '@/components/pages/Hello/CustomAnimation/VectorField/VectorField.vue'
import Wave from '@/components/pages/LeapMotion/Wave.vue'

import * as Leap from 'leapjs'

let vectorToString = (v) => {
  return v
}

// DomToucher
export default {
  props: {
    size: {},
    renderer: {}
  },
  components: {
    ...Bundle,
    Wave,
    // VectorField,
    BoxesGroup,
    Box
  },
  data () {
    Relay.internal.$forceUpdate = () => {
      this.$forceUpdate()
    }
    return {
      handCount: 0,
      hands: [],
      pointables: [],

      //

      Relay,
      boxesData: [
        {
          id: 'box1',
          formulas: {
            px: '-10',
            py: 'top - 20',
            pz: '0',
            width: '30',
            height: '30'
          }
        },
        {
          id: 'box2',
          formulas: {
            px: '10',
            py: 'i.box1.py - 25',
            pz: '0',
            width: '30',
            height: '30'
          }
        }
      ],

      THREE,
      scl: { onScroll () {} },
      camPos: { x: 0, y: 100, z: 180 },
      ori: false,
      resizer () {},
      fullscreen: false,
      scene: false,
      camera: false
    }
  },
  watch: {
    size () {
      this.composerResizer && this.composerResizer()
    }
  },
  computed: {
    res () {
      return this.size
    }
  },
  methods: {
    setupComposer () {
      var dpi = 1.5

      let composer = this.composer = new THREE.EffectComposer(this.renderer)
      composer.setSize(this.res.width * dpi, this.res.height * dpi)
      window.addEventListener('resize', () => {
        this.composerResizer()
      }, false)
      this.composerResizer = () => {
        composer.setSize(this.res.width * dpi, this.res.height * dpi)
      }
      this.$nextTick(this.composerResizer)

      let renderBG = new THREE.RenderPass(this.scene, this.camera)
      let bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(this.res.width * dpi, this.res.height * dpi), 1.5, 0.4, 0.85)
      bloomPass.renderToScreen = true

      // bloomPass.threshold = Number(0.0001)
      // bloomPass.strength = Number(3.5)
      // bloomPass.radius = Number(1.0)

      composer.addPass(renderBG)
      composer.addPass(bloomPass)
    },
    renderWebGL () {
      // let noHands = this.handCount === 0
      let useBloom = true

      if (useBloom && this.scene && this.camera && this.renderer && this.composer) {
        this.composer.render()
      } else if (this.scene && this.camera && this.renderer) {
        this.renderer.render(this.scene, this.camera)
      }
    },
    setupDomScroller () {
      this.scl = Scroller.make({ scroller: this.$refs['scroll-container'], content: this.$refs['scroll-content'] })
    }
  },
  created () {
    this.$on('add', (v) => {
      this.scene.add(v)
    })
    this.$on('remove', (v) => {
      this.scene.remove(v)
    })
  },
  mounted () {
    this.setupComposer()
    this.setupDomScroller()

    this.scene.background = new THREE.Color('#99c5c7')

    var self = this
    function loop () {
      self.rAFID = window.requestAnimationFrame(loop)
      self.renderWebGL()
    }
    self.rAFID = window.requestAnimationFrame(loop)

    //

    // leap
    Leap.loop((frame) => {
      this.handCount = frame.hands.length

      this.hands.forEach((h) => { h.activate = false })

      if (frame.hands.length > 0) {
        for (let i = 0; i < frame.hands.length; i++) {
          let handString = ''
          let hand = frame.hands[i]

          handString += 'Hand ID: ' + hand.id + '\n'
          handString += 'Direction: ' + vectorToString(hand.direction, 2) + '\n'
          handString += 'Palm normal: ' + vectorToString(hand.palmNormal, 2) + '\n'
          handString += 'Palm position: ' + vectorToString(hand.palmPosition) + ' mm\n'
          handString += 'Palm velocity: ' + vectorToString(hand.palmVelocity) + ' mm/s\n'
          handString += 'Sphere center: ' + vectorToString(hand.sphereCenter) + ' mm\n'
          handString += 'Sphere radius: ' + hand.sphereRadius.toFixed(1) + ' mm\n'

          // this.camPos = {
          //   x: hand.sphereCenter[0],
          //   y: hand.sphereCenter[1],
          //   z: this.camPos.z
          // }
          this.hands[i] = {
            activate: true,
            palm: hand.palmPosition,
            dir: hand.direction,
            string: handString
          }
          // this.hands[i] = handString || this.hands[i]
        }
      }

      if (frame.pointables.length > 0) {
        for (let i = 0; i < frame.pointables.length; i++) {
          let pointable = frame.pointables[i]
          let pointableString = ''
          pointableString += 'Pointable ID: ' + pointable.id + '\n'
          pointableString += 'Belongs to hand with ID: ' + pointable.handId + '\n'
          pointableString += 'Length: ' + pointable.length.toFixed(1) + ' mm\n'
          pointableString += 'Width: ' + pointable.width.toFixed(1) + ' mm\n'
          pointableString += 'Direction: ' + vectorToString(pointable.direction, 2) + '\n'
          pointableString += 'Tip position: ' + vectorToString(pointable.tipPosition) + ' mm\n'
          pointableString += 'Tip velocity: ' + vectorToString(pointable.tipVelocity) + ' mm/s\n'

          this.pointables[i] = {
            string: pointableString,
            tipPos: pointable.tipPosition,
            dir: pointable.direction
          }
          // pointableString || this.pointables[i]
        }
      }

      this.$forceUpdate()
    })

    // Ori

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
  beforeDestroy () {
    window.cancelAnimationFrame(this.rAFID)
  }
}
</script>

<style scoped>
* {
  -webkit-tap-highlight-color: rgba(0,0,0,0);
}

.full{
  width: 100%;
  height: 100%;
}

.toucher{
  position: absolute;
  top: 0px;
  left: 0px;
}

.tall{
  height: 30vh;
}

.scroll-container{
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.white{
  color: white;
}

</style>
