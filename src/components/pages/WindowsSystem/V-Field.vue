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
      <VectorField
        v-if="renderer && camera && ori"
        :orientation="ori"
        :camera="camera"
        :renderer="renderer"
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
import VectorField from '../Hello/CustomAnimation/VectorField/VectorField.vue'

export default {
  components: {
    ...Bundle,
    VectorField
  },
  props: {
    skip: { default: false },
    renderer: {},
    size: {}
  },
  data () {
    return {
      ori: false,
      colorMe: 0xffffff * Math.random(),
      rAFID: 0,
      scene: false,
      camera: false,
      camPos: {
        x: 0, y: 0, z: 35
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
uniform vec3 color;

void main () {
  gl_FragColor = vec4(
    vec3(
        vPos * 0.1
      + 0.5 * abs(cos(time * 10.0 + vPos.y))
    ) * color,
  1.0);
}
`,
        uniforms: {
          time: {
            value: 0
          },
          color: {
            value: new THREE.Color(0xffffff * Math.random())
          }
        }
      }
    }
  },
  computed: {
  },
  methods: {
    runWebGL () {
      this.shader.uniforms.time.value = window.performance.now() * 0.001

      if (this.renderer && this.camera && this.scene && this.$parent.rtt) {
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

      // this.scene.background = new THREE.Color('#bababa')
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
