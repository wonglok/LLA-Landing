<template>
<div></div>
</template>

<script>
import GPUComputationRenderer from '@/components/ThreeJS/System/GPUComputationRenderer.js'
import * as THREE from 'three'

function prepIndexer (texture, SIZE) {
  var pixels = texture.image.data
  var p = 0
  let max = SIZE * SIZE
  for (var j = 0; j < max; j++) {
    pixels[p + 0] = j
    pixels[p + 1] = j / (max)
    pixels[p + 2] = SIZE
    pixels[p + 3] = 1.0
    p += 4
  }
}

export default {
  props: {
    orientation: {},
    camera: {},
    mouse: {
      default () {
        return new THREE.Vector3()
      }
    },
    renderer: {},
    pingPongShader: {
      default () {
        return require('./simulation/pos-sim.frag')
      }
    }
  },
  data () {
    return {
      tempv3: new THREE.Vector3(),
      init () {},
      gpuCompute: false,
      getTexture: () => {},
      runSim: () => {},
      updateMouse: () => {}
    }
  },
  watch: {
    pingPongShader () {
      this.init({ pingPongShader: this.pingPongShader })
    }
  },
  mounted () {
    // var moveY = 0
    // var moveX = 0
    let SIZE = 128

    var gpuCompute = new GPUComputationRenderer(SIZE, SIZE, this.renderer)

    var indexerTexture = gpuCompute.createTexture()
    prepIndexer(indexerTexture, SIZE)

    var self = this
    function getPos () {
      var pos = self.tempv3.copy(self.camera.position).normalize()
      pos.multiplyScalar(-1.0)
      pos.x -= 2.0 * -self.orientation.yy
      pos.y -= 2.0 * self.orientation.xx
      pos.z = 0.0
      return pos
    }

    var initPingPoing = ({ shader }) => {
      var ticker = 0

      var pingTarget = gpuCompute.createRenderTarget()
      var pongTarget = gpuCompute.createRenderTarget()

      let pingMat, pongMat

      pingMat = gpuCompute.createShaderMaterial(shader, {
        lastTexture: { value: null },
        indexerTexture: { value: indexerTexture },
        addon1: { value: null },
        time: { value: 0 },
        mouse: { get value () {
          return getPos()
        } }
      })
      pongMat = gpuCompute.createShaderMaterial(shader, {
        lastTexture: { value: null },
        indexerTexture: { value: indexerTexture },
        addon1: { value: null },
        time: { value: 0 },
        mouse: { get value () {
          return getPos()
        } }
      })

      return {
        simulation: ({ addon1 }) => {
          var output = false

          pingMat.uniforms.lastTexture.value = pongTarget.texture
          pongMat.uniforms.lastTexture.value = pingTarget.texture

          pingMat.uniforms.time.value = window.performance.now() * 0.0001
          pongMat.uniforms.time.value = window.performance.now() * 0.0001

          pingMat.uniforms.addon1.value = addon1
          pongMat.uniforms.addon1.value = addon1

          if (ticker % 2 === 0) {
            gpuCompute.doRenderTarget(pingMat, pingTarget)
            output = pingTarget.texture
          } else {
            gpuCompute.doRenderTarget(pongMat, pongTarget)
            output = pongTarget.texture
          }

          ticker++
          return {
            texture: output
          }
        }
      }
    }

    var possim = initPingPoing({ shader: require('./simulation/pos-sim.frag') })

    // display part
    var planeGeometry = new THREE.PlaneBufferGeometry(1.0, 1.0, SIZE, SIZE)

    var material = new THREE.ShaderMaterial({
      // blending: THREE.AdditiveBlending,
      // depthTest: false,
      transparent: true,
      depthWrite: false,
      vertexShader: require('./display/display.vert'),
      fragmentShader: require('./display/display.frag'),
      defines: {
        resolution: 'vec2( ' + SIZE.toFixed(1) + ', ' + SIZE.toFixed(1) + ' )'
      },
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0.75 },
        posTex: { value: null },
        // indexerTexture: { value: indexerTexture },
        // picture: { value: new THREE.TextureLoader().load('https://picsum.photos/256/256', (texture) => { texture.flipY = true; texture.needsUpdate = true }) },
        picture: { value: new THREE.TextureLoader().load(require('@/components/pages/Hello/Elements/Text/Images/sunset.jpg'), (texture) => { texture.flipY = true; texture.needsUpdate = true }) },
        pointSize: { value: window.devicePixelRatio || 1.0 },
        mouse: { get value () {
          return getPos()
        } }
      }
    })

    var objects = this.objects = new THREE.Points(planeGeometry, material)
    objects.matrixAutoUpdate = false
    objects.frustumCulled = false

    // objects.scale.x = 0.5
    // objects.scale.y = 0.5
    // objects.scale.z = 0.5
    objects.updateMatrix()

    let rAF = () => {
      this.rAFID = window.requestAnimationFrame(rAF)
      var possimo = possim.simulation({ addon1: null })

      material.uniforms.posTex.value = possimo.texture
      material.uniforms.time.value = window.performance.now() * 0.0001
    }
    this.rAFID = window.requestAnimationFrame(rAF)

    this.$parent.$emit('add', objects)
    this.$emit('gpgpu', this)
  },
  beforeDestroy () {
    this.$parent.$emit('remove', this.objects)
    window.cancelAnimationFrame(this.rAFID)
  },
  methods: {
    mousePos () {
      let pos = this.tempv3.copy(this.camera.position)
      return pos
    }
  }
}
</script>

<style>
</style>
