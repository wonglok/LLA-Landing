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

      <!-- layoutItems -->
      <Object3D @element="(v) => {
        scroller = v; setupScroll()
      }" v-if="fullscreen && layoutItems" :pz="-5">

        <Object3D :key="item.id" v-for="item in layoutItems">
          <LayoutItem :data="item" :fs="fullscreen" :page="page" />
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
// , DomToucher
export default {
  props: {
    size: {},
    renderer: {}
  },
  components: {
    ...Bundle
  },
  computed: {
  },
  methods: {
    setupScroll () {
      let self = this
      let touchSurface = this.$refs['touch-surface']
      var sizer = {
        get eGroup () {
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
          return this.eGroup.reduce(this.reduceMaxX, 0)
        },
        get totalY () {
          return this.eGroup.reduce(this.reduceMaxY, 0) - self.fullscreen.height * 0.5 + this.lastItemHalf
        },
        get lastItemHalf () {
          // if there is no last item then return 0
          if (!this.eGroup[this.eGroup.length - 1]) { return 0 }
          return this.eGroup[this.eGroup.length - 1].geometry.parameters.height * 0.5 + 1.0
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

        // let moveAmountX = evt.state.inX * 0.35
        let moveAmountY = evt.state.inY * 0.35
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
      scroller: false,
      resizer () {},
      fullscreen: false,
      scene: false,
      camera: false,
      page: landing.makePage(),
      layoutItems: landing.makeLayouts()
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
