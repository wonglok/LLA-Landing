<template>
  <div class="full">
    <div class="full toucher" ref="touch-surface">

      <div class="full scroll-container" ref="scroll-container" @scroll="scl.onScroll">
        <div class="scroll-content" ref="scroll-content">
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

      <Box
        v-if="scl && scl.state && scene"
        :scl="scl"
      />

    </Scene>

  </div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'
import * as THREE from 'three'
import * as Scroller from '@/components/shared/DomScroller/DomScroller.js'

import Box from './Box/Box.vue'
// DomToucher
export default {
  props: {
    size: {},
    renderer: {}
  },
  components: {
    ...Bundle,
    Box
  },
  data () {
    return {
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
  computed: {

  },
  methods: {
    renderWebGL () {
      if (this.scene && this.camera && this.renderer) {
        this.renderer.render(this.scene, this.camera)
      }
    },
    setupDomScroller () {
      this.scl = Scroller.make({ scroller: this.$refs['scroll-container'], content: this.$refs['scroll-content'] })
    },
    setupOrientation () {
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
      var resizer = this.resizer = () => {
        // if (!this.camera) { return }
        // this.fullscreen = fullScreener({ planeZ: -5, camera: this.camera })
      }
      window.addEventListener('resize', resizer, false)
      resizer()
      this.$nextTick(resizer)
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
    this.setupDomScroller()

    this.setupOrientation()

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

.tall{
  height: 30vh;
}

.scroll-container{
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

</style>
