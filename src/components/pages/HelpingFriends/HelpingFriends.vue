<template>
  <div class="full">
    <div class="full toucher" ref="touch-surface">

      <div class="full scroll-container" ref="scroll-container" @scroll="scl.onScroll">
        <div class="scroll-content" ref="scroll-content">

          <!-- <pre class="white">{{ Relay }}</pre> -->

          <!-- <input v-if="Relay.internal.state" type="range" step="0.000001" min="-100" max="100" v-model="Relay.internal.state.slider"> -->

          <div :key="box.id" v-for="box in boxesData">
            x<input type="text" v-model="box.formulas.px" />
            y<input type="text" v-model="box.formulas.py" />
            z<input type="text" v-model="box.formulas.pz" />
          </div>

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

      <BoxesGroup
        v-if="scl && scl.state && scene && camera"
        :scl="scl"
        :boxesData="boxesData"
        :camera="camera"
      />

    </Scene>

  </div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'
import * as THREE from 'three'
import * as Scroller from '@/components/shared/DomScroller/DomScroller.js'

// import * as Relay from '@/components/shared/RelayConnector/relay.js'

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

import BoxesGroup from './Box/BoxesGroup.vue'
// DomToucher
export default {
  props: {
    size: {},
    renderer: {}
  },
  components: {
    ...Bundle,
    BoxesGroup
  },
  data () {
    // Relay.internal.$forceUpdate = this.$forceUpdate.bind(this)
    return {
      // Relay,
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
      camPos: { x: 0, y: 0, z: 45 },
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
      var dpi = 1.0

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
      if (this.scene && this.camera && this.renderer && this.composer) {
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
