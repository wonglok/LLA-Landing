<template>
<div class="hidden"></div>
</template>

<script>
import * as THREE from 'three'
import TextCanvas from 'text-canvas'
export default {
  props: {
    effect: {
    },
    pos: {
      default () {
        return { x: 0, y: 0, z: 0 }
      }
    },
    vs: {},
    fs: {},
    defaultText: {
      default: 'Click me to edit.'
    },
    width: {
      default: 300
    },
    transparent: {
      default: true
    },
    fontSize: {
    },
    fontFamily: {
      default: '\'InterUI\', \'Avenir\', Helvetica, Arial, sans-serif'
    },
    text: {
      default: 'Text '
    }
  },
  data () {
    return {
      uniforms: {},
      rAFID: 0,
      canvas: false,
      textCanvas: false,
      textureOfCanvas: false,
      plane: false,
      material: false,
      scale: 60,
      timer: 0
    }
  },
  watch: {
    vs () {
      this.loadMaterial()
    },
    fs () {
      this.loadMaterial()
    },
    posJSON () {
      this.plane.position.copy(this.pos)
    },
    transparent () {
      this.material.transparent = this.transparent
      this.loadMaterial()
    },
    text (newText, oldText) {
      if (newText !== oldText) {
        this.$nextTick(() => {
          this.update({ newText })
        })
      }
    },
    width () {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.update({ newText: this.text })
      }, 8.33333)
    },
    fontSize () {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.update({ newText: this.text })
      }, 28.33333)
    },
    fontFamily () {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.update({ newText: this.text })
      }, 8.33333)
    }
  },
  mounted () {
    this.setup()
  },
  methods: {
    update ({ newText }) {
      this.$nextTick(() => {
        this.textCanvas.text = newText.trim() || this.defaultText
        this.textCanvas.style = this.style
        this.textCanvas.render()

        let planeGeometry = new THREE.PlaneBufferGeometry(this.canvas.width / this.scale, this.canvas.height / this.scale, 80, 80)
        this.plane.geometry = planeGeometry
        this.$nextTick(() => {
          this.material.needsUpdate = true
          this.textureOfCanvas.needsUpdate = true
          this.$emit('layout', {
            mesh: this.mesh,
            width: this.canvas.width / this.scale,
            height: this.canvas.height / this.scale
          })
        })
      })
    },
    loop () {
      let rAF = () => {
        this.rAFID = window.requestAnimationFrame(rAF)
        this.uniforms.time.value = window.performance.now() * 0.001
      }
      this.rAFID = window.requestAnimationFrame(rAF)
    },
    setup () {
      this.textCanvas = new TextCanvas(this.text || this.defaultText, this.style, 2.0)
      this.canvas = this.textCanvas.render()
      this.textureOfCanvas = new THREE.CanvasTexture(this.canvas)

      let planeGeometry = new THREE.PlaneBufferGeometry(this.canvas.width / this.scale, this.canvas.height / this.scale, 80, 80)
      this.plane = new THREE.Mesh(planeGeometry)
      this.loadMaterial()

      this.update({ newText: this.text })
      this.plane.position.copy(this.pos)

      this.loop()

      this.$parent.$emit('add', this.plane)
      this.$emit('attach', this.plane)
    },
    loadMaterial () {
      if (this.fs && this.vs) {
        let uniforms = this.uniforms = {
          text: { value: this.textureOfCanvas },
          pattern: { value: new THREE.TextureLoader().load(require('./Images/fabric.jpg')) },
          time: { value: 0 }
        }
        this.material = new THREE.ShaderMaterial({
          uniforms: uniforms,
          transparent: this.transparent,
          vertexShader: this.vs,
          fragmentShader: this.fs
        })
        this.textureOfCanvas.needsUpdate = true
        this.plane.material = this.material
        this.plane.needsUpdate = true
      } else {
        // this.material = new THREE.MeshBasicMaterial({ map: this.textureOfCanvas, transparent: this.transparent })
        let uniforms = this.uniforms = {
          pattern: { value: new THREE.TextureLoader().load(require('./Images/fabric.jpg')) },
          text: { value: this.textureOfCanvas },
          time: { value: 0 }
        }
        this.material = new THREE.ShaderMaterial({
          uniforms: uniforms,
          transparent: this.transparent,
          vertexShader: require('./Shaders/Golden/vs.vert'),
          fragmentShader: require('./Shaders/Golden/fs.frag')
        })
        this.textureOfCanvas.needsUpdate = true
        this.plane.material = this.material
        this.plane.needsUpdate = true
      }
    }
  },
  beforeDestroy () {
    window.cancelAnimationFrame(this.rAFID)
    this.$parent.$emit('remove', this.plane)
    this.$emit('detach', this.plane)
  },
  computed: {
    posJSON () {
      return JSON.stringify(this.pos)
    },
    style () {
      return {
        fontFamily: this.fontFamily,
        fontSize: (this.fontSize + '') || '24',
        wordWrap: this.width || 300
      }
    }
  }
}
</script>

<style scoped>
.hidden{
  display: none;
}
</style>
