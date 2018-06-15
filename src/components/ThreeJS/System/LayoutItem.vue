<template>
<div class="texture-loader"><slot></slot></div>
</template>

<script>
import * as THREE from 'three'
var Parser = require('expr-eval').Parser

/* eslint-disable */
// import 'imports-loader?THREE=three!./TextureLoader.js'
// import 'imports-loader?THREE=three!three/examples/js/loaders/SVGLoader.js'
// import 'imports-loader?THREE=three!three/examples/js/renderers/SVGRenderer.js'
/* eslint-enable */

export default {
  props: {
    data: {},
    fs: {},
    page: {}
    // src: { default () { return require('../textures/tiger.svg') } },
    // material: {
    //   default () {
    //     return false
    //   }
    // }
  },
  data () {
    return {
      image: false,
      texture: false,
      geometry: false,
      material: false,
      mesh: false,
      obj3D: false,
      size: false,
      resizer () {},
      updatepos () {},
      updateSize () {},
      Parser,
      THREE,
      isActive: true,
      clean () {},
      loader: new THREE.ImageLoader()
    }
  },
  watch: {
    fs () {
      this.resizer()
    }
  },
  mounted () {
    // this.loadImage()
    // window.addEventListener('resize', () => {
    //   if (this.isActive) {
    //     this.loadImage()
    //   }
    // }, false)

    this.onMount()
  },
  methods: {
    // 1. load image
    // 2. prepare texture
    // 3. prepare geometry
    // 4. prepare mesh
    // 5. prepare object position

    // on resize screen
    // 1. prep geo
    // 2. prep object position
    loadImage ({ src }) {
      return new Promise((resolve, reject) => {
        this.loader.load(src, resolve)
      })
    },
    prepareTexture ({ image }) {
      return new Promise((resolve, reject) => {
        var dpi = window.devicePixelRatio < 1.5 ? 1.5 : window.devicePixelRatio * 1.25
        var canvas = document.createElement('canvas')

        canvas.width = image.width * dpi
        canvas.height = image.height * dpi

        var ctx = canvas.getContext('2d')
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

        let map = new THREE.CanvasTexture(canvas)
        map.needsUpdate = true

        resolve(map)
      })
    },
    prepareGeo ({ size }) {
      var nx = 30
      var ny = 30

      let geometry = new THREE.PlaneBufferGeometry(size.width, size.height, nx, ny)
      return geometry
    },
    prepareMaterial ({ texture }) {
      return new Promise((resolve, reject) => {
        let material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true
        })
        resolve(material)
      })
    },
    prepareMesh ({ geometry, material }) {
      return new Promise((resolve, reject) => {
        let mesh = new THREE.Mesh(geometry, material)
        resolve(mesh)
      })
    },
    evalSize ({ formulas, info }) {
      return {
        width: Parser.evaluate(formulas.width, info),
        height: Parser.evaluate(formulas.height, info)
      }
    },
    evalPosition ({ formulas, info }) {
      return {
        x: Parser.evaluate(formulas.x, info),
        y: Parser.evaluate(formulas.y, info),
        z: Parser.evaluate(formulas.z, info)
      }
    },
    makeObject3D () {
      return new THREE.Object3D()
    },
    setObject3D ({ obj3D, position }) {
      obj3D.position.x = position.x
      obj3D.position.y = position.y
      obj3D.position.z = position.z
      return obj3D
    },
    async onMount () {
      let image = this.image = await this.loadImage({ src: this.data.src })
      let texture = this.texture = await this.prepareTexture({ image })
      let size = this.size = await this.evalSize({
        formulas: this.data.formulas,
        info: {
          fsw: this.fs.width,
          fsh: this.fs.height,
          fsa: this.fs.aspect,
          ia: this.image.width / this.image.height
        }
      })
      let geometry = this.geometry = await this.prepareGeo({ image, size })
      let material = this.material = await this.prepareMaterial({ texture })
      let mesh = this.mesh = await this.prepareMesh({ geometry, material })
      let obj3D = this.obj3D = this.makeObject3D()
      obj3D.add(mesh)

      this.updatePos = () => {
        let position = this.evalPosition({
          formulas: this.data.formulas,
          info: {
            fsw: this.fs.width,
            fsh: this.fs.height,
            fsa: this.fs.aspect,
            ia: this.image.width / this.image.height,

            szw: this.size.width,
            szh: this.size.height,
            sza: this.size.width / this.size.height,
            ...this.page.state.layout
          }
        })
        // console.log(this.page.state.layout)

        this.setObject3D({
          obj3D: this.obj3D,
          position
        })
        this.page.register(this)
      }

      this.updateSize = () => {
        let size = this.size = this.evalSize({
          formulas: this.data.formulas,
          info: {
            fsw: this.fs.width,
            fsh: this.fs.height,
            fsa: this.fs.aspect,
            ia: this.image.width / this.image.height
          }
        })

        let geometry = this.geometry = this.prepareGeo({ image, size })
        this.mesh.geometry = geometry
        this.page.register(this)
      }

      this.resizer = () => {
        try {
          this.updatePos()
          this.updateSize()
        } catch (e) {
          console.error(e)
          setTimeout(() => {
            this.resizer()
          }, 1000)
        }
      }

      this.resizer()
      window.addEventListener('resize', this.resizer, false)

      this.$parent.$emit('add', obj3D)
      if (this.clean) {
        this.clean()
      }
      this.clean = () => {
        window.removeEventListener('resize', this.resizer)
        this.$parent.$emit('remove', obj3D)
      }
      this.$emit('element', this)
      this.$emit('resizer', this.resizer)
      this.page.register(this)
    }
  },
  beforeDestroy () {
    this.isActive = false
    this.clean()
  }
}
</script>

<style scoped>
</style>
