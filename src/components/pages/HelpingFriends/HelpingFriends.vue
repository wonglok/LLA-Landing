<template>
  <div class="full">
    <div class="full toucher" ref="touch-surface">
    </div>

    <PerspectiveCamera
      :fov="75"
      :aspect="size.aspect"
      :near="1"
      :far="1000"
      :position="camPos"
      @camera="(v) => { camera = v; resizer() }"
    />

    <Scene @scene="(v) => { scene = v }">

      <!-- OMG -->

      <!-- LOL -->

    </Scene>

  </div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'
import * as THREE from 'three'
// import { fullScreener, DomToucher } from '@/components/shared/tools.js'

// DomToucher
export default {
  props: {
    size: {},
    renderer: {}
  },
  components: {
    ...Bundle
  },
  data () {
    return {
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
    }
  },

  created () {

  },
  mounted () {
    var resizer = this.resizer = () => {
      // if (!this.camera) { return }
      // this.fullscreen = fullScreener({ planeZ: -5, camera: this.camera })
    }
    window.addEventListener('resize', resizer, false)
    resizer()
    this.$nextTick(resizer)

    this.setupOrientation()

    this.scene.background = new THREE.Color(0xffffff)

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
