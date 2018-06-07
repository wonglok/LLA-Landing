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
        return require('./simulation/sim.frag')
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
    var count = 0
    let SIZE = 128

    var gpuCompute = new GPUComputationRenderer(SIZE, SIZE, this.renderer)

    var indexerTexture = gpuCompute.createTexture()
    prepIndexer(indexerTexture, SIZE)

    var pingTarget = gpuCompute.createRenderTarget()
    var pongTarget = gpuCompute.createRenderTarget()

    let pingMat, pongMat

    let pingPongShader = this.pingPongShader

    let displayV = require('./display/display.vert')
    let displayF = require('./display/display.frag')

    let init = ({ pingPongShader }) => {
      let lastTap = 2

      if (pingMat) {
        lastTap = pingMat.uniforms.tapCount.value
      }

      var self = this

      function getPos () {
        var pos = self.tempv3.copy(self.camera.position).normalize()
        pos.multiplyScalar(-1.0)
        pos.x -= 2.0 * -self.orientation.yy
        pos.y -= 2.0 * self.orientation.xx
        pos.z = 0.0
        return pos
      }

      pingMat = gpuCompute.createShaderMaterial(pingPongShader, {
        tapCount: { value: lastTap || 0 },
        lastTexture: { value: null },
        indexerTexture: { value: indexerTexture },
        time: { value: 0 },
        mouse: { get value () {
          return getPos()
        } }
      })
      pongMat = gpuCompute.createShaderMaterial(pingPongShader, {
        tapCount: { value: lastTap || 0 },
        lastTexture: { value: null },
        indexerTexture: { value: indexerTexture },
        time: { value: 0 },
        mouse: { get value () {
          return getPos()
        } }
      })
    }
    this.init = init
    init({ pingPongShader })

    // setInterval(() => {
    //   pingMat.uniforms.tapCount.value++
    //   pongMat.uniforms.tapCount.value++
    // }, 3000)

    // sim part
    let procSim = () => {
      pingMat.uniforms.lastTexture.value = pongTarget.texture
      pongMat.uniforms.lastTexture.value = pingTarget.texture

      pingMat.uniforms.time.value = window.performance.now() * 0.0001
      pongMat.uniforms.time.value = window.performance.now() * 0.0001

      if (count % 2 === 0) {
        gpuCompute.doRenderTarget(pongMat, pongTarget)
      } else {
        gpuCompute.doRenderTarget(pingMat, pingTarget)
      }
    }

    // display part
    var geometry = new THREE.PlaneBufferGeometry(1.0, 1.0, SIZE, SIZE)
    var material = new THREE.ShaderMaterial({
      // blending: THREE.AdditiveBlending,
      // depthTest: false,
      transparent: true,
      depthWrite: false,
      vertexShader: displayV,
      fragmentShader: displayF,
      defines: {
        resolution: 'vec2( ' + SIZE.toFixed(1) + ', ' + SIZE.toFixed(1) + ' )'
      },
      uniforms: {

        time: { value: 0 },
        opacity: { value: 1.0 },
        posTex: { value: null },
        indexerTexture: { value: indexerTexture },
        // picture: { value: new THREE.TextureLoader().load('https://picsum.photos/256/256', (texture) => { texture.flipY = true; texture.needsUpdate = true }) },
        picture: { value: new THREE.TextureLoader().load(require('@/components/pages/Hello/Elements/Text/Images/waves.svg'), (texture) => { texture.flipY = true; texture.needsUpdate = true }) },
        pointSize: { value: window.devicePixelRatio || 1.0 }
      }
    })

    var points = this.points = new THREE.Points(geometry, material)
    points.scale.multiplyScalar(0.73)

    points.matrixAutoUpdate = false
    points.updateMatrix()
    points.frustumCulled = false

    let rAF = () => {
      this.rAFID = window.requestAnimationFrame(rAF)
      procSim()
      if (count % 2 === 0) {
        material.uniforms.posTex.value = pongTarget.texture
      } else {
        material.uniforms.posTex.value = pingTarget.texture
      }
      count++
      material.uniforms.time.value = window.performance.now() * 0.0001
    }
    this.rAFID = window.requestAnimationFrame(rAF)

    this.$parent.$emit('add', points)
    this.$emit('gpgpu', this)
  },
  beforeDestroy () {
    this.$parent.$emit('remove', this.points)
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
