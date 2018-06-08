<template>
<div>
  <Scene @scene="(v) => { $emit('scene', v); scene = v }">

    <!-- <Object3D :pz="30">
      <PointLight :color="colorMe" />
    </Object3D> -->

    <!-- <Mesh>
      <SphereBufferGeometry :nx="50" :ny="50" :r="13"></SphereBufferGeometry>
      <ShaderMaterial :vs="shader.vs" :fs="shader.fs" :uniforms="shader.uniforms"></ShaderMaterial>
    </Mesh> -->

    <Object3D>
      <ParticleFormula
        v-if="renderer && camera && ori"
        :orientation="ori"
        :camera="camera"
        :renderer="renderer"
        :mode="3"
      />
    </Object3D>

  </Scene>

  <PerspectiveCamera
    :fov="75"
    :aspect="size.aspect"
    :near="1"
    :far="10000"
    :position="camPos"
    @camera="(v) => { $emit('camera', v); camera = v }"
  />

</div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'
import * as THREE from 'three'
import ParticleFormula from '../../Hello/CustomAnimation/ParticleFormula/ParticleFormula.vue'
/* eslint-disable */

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
    ParticleFormula
  },
  props: {
    skip: { default: false },
    renderer: {},
    size: {}
  },
  data () {
    return {
      ori: false,
      colorMe: 0xffffff * (Math.random() + 2.3),
      rAFID: 0,
      scene: false,
      camera: false,
      camPos: {
        x: 0, y: 0, z: 25
      },
      shader: {
        vs:
`
#include <common>

varying vec2 vUv;
varying vec3 vPos;

uniform float time;

void main ( void ) {
  vec3 newPos = position;
  newPos.z += sin(newPos.y + time * 5.0);

  vPos = position;
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4( newPos, 1.0 );

  vec4 outputPos = projectionMatrix * mvPosition;
  gl_Position = outputPos;
}
`,
        fs:
`
varying vec2 vUv;
varying vec3 vPos;

uniform float time;

void main () {
  float x = vPos.x * sin(time * 3.0) * 0.1;
  float y = vPos.y * cos(time * 3.0) * 0.1;
  float z = vPos.z * sin(time * 3.0) * 0.1;

  vec4 a = vec4(vUv.x + 0.04 + x, vUv.y + y, vUv.y + vUv.x + z, 1.0);

  gl_FragColor = vec4(a.xyz, 1.0);
}
`,
        uniforms: {
          time: {
            value: 0
          }
        }
      }
    }
  },
  watch: {
    width () {
      this.resizer()
    },
    height () {
      this.resizer()
    }
  },
  computed: {
    width () {
      return this.size.width
    },
    height () {
      return this.size.height
    }
  },
  methods: {
    runWebGL () {
      this.shader.uniforms.time.value = window.performance.now() * 0.001

      if (this.renderer && this.composer && this.camera && this.scene && this.$parent.rtt) {
        this.composer.render()
      } else if (this.renderer && this.camera && this.scene && this.$parent.rtt) {
        this.renderer.render(this.scene, this.camera, this.$parent.rtt)
      } else if (this.renderer && this.camera && this.scene) {
        this.renderer.render(this.scene, this.camera)
      }
    },
    setup () {
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

      // let rtParameters = {
      //   minFilter: THREE.LinearFilter,
      //   magFilter: THREE.LinearFilter,
      //   format: THREE.RGBFormat,
      //   stencilBuffer: true
      // }
      var dpi = 1.0

      let composer = this.composer = new THREE.EffectComposer(this.renderer, this.$parent.rtt)
      composer.setSize(this.size.width * dpi, this.size.height * dpi)
      window.addEventListener('resize', () => {
        this.resizer()
      }, false)
      this.resizer = () => {
        composer.setSize(this.size.width * dpi, this.size.height * dpi)
      }
      this.$nextTick(this.resizer)

      let renderBG = new THREE.RenderPass(this.scene, this.camera)
      let bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(this.size.width, this.size.height), 1.5, 0.4, 0.85)
      // bloomPass.renderToScreen = true

      bloomPass.threshold = Number(0.71)
      bloomPass.strength = Number(1.5)
      bloomPass.radius = Number(1.0)

      composer.addPass(renderBG)
      composer.addPass(bloomPass)

      this.$emit('texture', this.composer.readBuffer.texture)

      this.scene.background = new THREE.Color('hsl(0, 74%, 68%)')
    }
  },
  mounted () {
    this.setup()
    var rAF = () => {
      this.rAFID = window.requestAnimationFrame(rAF)
      if (this.skip) { return }
      this.runWebGL()
    }
    this.rAFID = window.requestAnimationFrame(rAF)
  }
}
</script>

<style>

</style>
