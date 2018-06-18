<template>
  <div class="full">
    <div class="full toucher" ref="touch-surface"></div>


    <PerspectiveCamera
      :fov="75"
      :aspect="size.aspect"
      :near="1"
      :far="1000"
      :position="{ x: 0, y: 0, z: 10 }"
      @camera="(v) => { camera = v; resizer() }"
    />

    <Scene @scene="(v) => { scene = v }">

      <!-- mobile414 -->
      <Object3D @element="(v) => {
        scroller = v; setupScroll()
      }" v-if="fullscreen && mobile414 && winWidth < 768" :pz="-5">
        <Object3D :key="item.id" v-for="item in mobile414">
          <LayoutItem :data="item" :fs="fullscreen" :page="page">

            <component
              v-if="renderer"
              :renderer="renderer"
              :is="item.component"
            />

          </LayoutItem>
        </Object3D>
      </Object3D>

      <!-- tablet768 -->
      <Object3D @element="(v) => {
        scroller = v; setupScroll()
      }" v-if="fullscreen && tablet768 && winWidth >= 768" :pz="-5">
        <Object3D :key="item.id" v-for="item in tablet768">
          <LayoutItem :data="item" :fs="fullscreen" :page="page">

            <component
              v-if="renderer"
              :renderer="renderer"
              :is="item.component"
            />

          </LayoutItem>
        </Object3D>
      </Object3D>

    </Scene>

  </div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'
import * as THREE from 'three'
import { fullScreener, DomToucher } from '@/components/shared/tools.js'
import * as landing from '@/components/pages/LandingPage/code/landing.js'

import VectorField from '@/components/pages/Hello/CustomAnimation/VectorField/VectorField.vue'
import GlowingWindow from '@/components/pages/LandingPage/GlowingWindow.vue'

// , DomToucher
export default {
  props: {
    size: {},
    renderer: {}
  },
  components: {
    ...Bundle,
    VectorField,
    GlowingWindow
  },
  computed: {
  },
  methods: {
    setupScroll () {
      let self = this
      let touchSurface = this.$refs['touch-surface']
      var sizer = {
        get elements () {
          return self.page.state.array.elements
        },
        reduceMaxX: (accu, eg, key) => {
          if (!eg.obj3D.position) { return accu }
          let length = Math.abs(eg.obj3D.position.x)
          if (length >= accu) {
            accu = length
          }
          return accu
        },
        reduceMaxY: (accu, eg, key) => {
          if (!eg.obj3D.position) { return accu }
          let length = Math.abs(eg.obj3D.position.y)
          if (length >= accu) {
            accu = length
          }
          return accu
        },
        get totalX () {
          return this.elements.reduce(this.reduceMaxX, 0)
        },
        get totalY () {
          return this.elements.reduce(this.reduceMaxY, 0) - self.fullscreen.height * 0.5 + this.lastItemHalf
        },
        get lastItemHalf () {
          // if there is no last item then return 0
          if (!this.elements[this.elements.length - 1]) { return 0 }
          return this.elements[this.elements.length - 1].geometry.parameters.height * 0.5 + 1.0
        }
      }

      var mover = this.mover = new DomToucher({ toucher: touchSurface })
      console.log(sizer)

      mover.addEventListener('update', (evt) => {
        // Scroll X
        let maxX = 0
        let minX = -sizer.totalX
        let maxY = sizer.totalY
        let minY = 0

        // let moveAmountX = evt.state.inX * 0.25
        let moveAmountY = evt.state.inY * 0.25
        let scroller = this.scroller
        if (scroller) {
          // if (this.fs) {
          //   // if one row
          //   if (this.fs.aspect <= 1) {
          //     scroller.position.x += moveAmountY + moveAmountX
          //   } else {
          //     // if 2x2
          //     scroller.position.x += moveAmountX
          //     scroller.position.y += -moveAmountY
          //   }
          // } else {
          //   // if no fullscreen detected
          //   scroller.position.x += moveAmountX
          //   scroller.position.y += -moveAmountY
          // }

          scroller.position.y -= moveAmountY

          if (scroller.position.x > maxX) {
            let varying = { ...scroller.position }
            varying.x -= (varying.x - maxX) * 0.35
            scroller.position.set(varying.x, varying.y, varying.z)
          }
          if (scroller.position.x < minX) {
            let varying = { ...scroller.position }
            varying.x -= (varying.x - minX) * 0.35
            scroller.position.set(varying.x, varying.y, varying.z)
          }

          if (scroller.position.y > maxY) {
            let varying = { ...scroller.position }
            varying.y -= (varying.y - maxY) * 0.35
            scroller.position.set(varying.x, varying.y, varying.z)
          }
          if (scroller.position.y < minY) {
            let varying = { ...scroller.position }
            varying.y -= (varying.y - minY) * 0.35
            scroller.position.set(varying.x, varying.y, varying.z)
          }
        }
      })
    },
    renderWebGL () {
      if (this.scene && this.camera && this.renderer) {
        this.renderer.render(this.scene, this.camera)
      }
    }
  },
  data () {
    return {
      get winWidth () {
        return window.innerWidth
      },
      scroller: false,
      resizer () {},
      fullscreen: false,
      scene: false,
      camera: false,
      page: landing.makePage(),

      mobile414: landing.makeMobile414(),
      tablet768: landing.makeTablet768()
    }
  },
  created () {

  },
  mounted () {
    var resizer = this.resizer = () => {
      if (!this.camera) { return }
      this.fullscreen = fullScreener({ planeZ: -5, camera: this.camera })
    }
    window.addEventListener('resize', resizer, false)
    resizer()
    this.$nextTick(resizer)

    this.scene.background = new THREE.Color(0x000000)

    var self = this
    function loop () {
      self.rAFID = window.requestAnimationFrame(loop)
      self.renderWebGL()
    }
    self.rAFID = window.requestAnimationFrame(loop)
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
</style>
