<template>
<div class="full">

  <div class="full toucher" ref="touch-surface"></div>

  <div v-if="current.data && mode === 'SceneEdit'" class="full closer" @click="current.data = false; current.mesh = false;"></div>

  <div class="editor">
    <div v-if="current.data && mode === 'SceneEdit'" >
      <TextEdit v-if="current.data && current.data.arr === 'words'" :info="current.data" :current="current" :root="root" />
    </div>
    <!-- <pre>{{JSON.stringify(nowPos, null, '  ').replace(/"/g, '')}}</pre> -->
  </div>

  <Scene @scene="(v) => { $emit('scene', v); scene = v }">
    <!-- Text Outlet -->
    <Object3D :pz="0.0">
      <TextOutlet ref="text-outlet" v-if="root" :root="root" :group="dragGroup" />
    </Object3D>

    <!-- <Object3D :pz="-8">
      <ParticleFormula
        v-if="renderer && camera && ori"
        :orientation="ori"
        :camera="camera"
        :renderer="renderer"
      />
    </Object3D> -->

    <Object3D :px="-15.0 * 0.0">
      <VectorField
        v-if="renderer && camera && ori"
        :orientation="ori"
        :camera="camera"
        :renderer="renderer"
      />
    </Object3D>
    <Object3D :px="15.0 * 0.0">
      <Instancing
        v-if="renderer && camera && ori"
        :orientation="ori"
        :camera="camera"
        :renderer="renderer"
      />
    </Object3D>

  </Scene>

  <PerspectiveCamera
    :fov="90"
    :aspect="size.aspect"
    :near="0.1"
    :far="10000"
    @camera="(v) => { $emit('camera', v); camera = v }"
  />

</div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'

/* eslint-disable */
import * as TWEEN from '@tweenjs/tween.js'
import * as THREE from 'three'

import 'imports-loader?THREE=three!../../shared/Touch/TrackTrack.js'
import 'imports-loader?THREE=three!../../shared/Touch/DragDrag.js'

// import 'imports-loader?THREE=three!three/examples/js/controls/TrackBallControls.js'
// import 'imports-loader?THREE=three!./Touch/TrackTrack.js'
// import 'imports-loader?THREE=three!./Touch/DragDrag.js'
/* eslint-enable */

import TextOutlet from './Elements/Text/TextOutlet.vue'
import TextEdit from './Elements/Text/TextEdit.vue'

import ParticleFormula from './CustomAnimation/ParticleFormula/ParticleFormula.vue'
import Instancing from './CustomAnimation/Instancing/Instancing.vue'
import VectorField from './CustomAnimation/VectorField/VectorField.vue'

import * as MS from './Data/HelloData.js'

export default {
  components: {
    ...Bundle,
    TextOutlet,
    TextEdit,
    ParticleFormula,
    Instancing,
    VectorField
  },
  props: {
    renderer: {},
    size: {}
  },
  data () {
    return {
      ori: false,
      tempv3: new THREE.Vector3(),
      nowPos: new THREE.Vector3(),

      // text outlet
      MS,
      touchSurface: false,
      mode: 'SceneEdit',
      dragGroup: [],
      current: {
        mesh: false,
        data: false
      },
      root: false,
      rAFID: 0,

      scene: false,
      camera: false
    }
  },
  watch: {
    mode () {
      if (this.mode === 'SceneEdit') {
        this.touchDragControl.deactivate()
        this.touchDragControl.activate()
      } else {
        this.touchDragControl.deactivate()
      }
    }
  },
  computed: {
    lid () {
      return this.$route.params.lid
    }
  },
  methods: {
    removeEffectBox (v) {
      let heart = this.$refs['heart']
      if (heart) {
        heart.removeCurrentBox(v)
      }
    },
    // refreshGLSL () {
    //   let text = this.$refs['text-outlet']
    //   if (text) {
    //     text.$forceUpdate()
    //   }
    //   // let heart = this.$refs['heart']
    //   // if (heart) {
    //   //   heart.tryRefreshGLSL()
    //   //   this.glsl = EN.makeGLSL({ root: this.current.data.effect })
    //   // }
    // },
    refreshGUI () {
      // let heart = this.$refs['heart']
      // if (heart) {
      //   heart.tryRefreshGUI()
      //   setTimeout(() => {
      //     heart.tryRefreshGUI()
      //   }, 17)
      //   setTimeout(() => {
      //     heart.tryRefreshGUI()
      //   }, 30)
      //   setTimeout(() => {
      //     heart.tryRefreshGUI()
      //   }, 60)
      // }
    },
    runWebGL () {
      if (this.touchPanControl) {
        this.touchPanControl.update()
      }

      if (this.renderer && this.camera && this.scene) {
        this.renderer.render(this.scene, this.camera)
      }
    },
    setup () {
      this.camera.position.z = 40
      this.scene.background = new THREE.Color('#fdfdfd')

      let touchSurface = this.touchSurface = this.$refs['touch-surface']
      let camera = this.camera

      let touchPanControl = this.touchPanControl = new THREE.TrackTrack(camera, touchSurface)
      touchPanControl.rotateSpeed = 1.0
      touchPanControl.zoomSpeed = 3.0
      touchPanControl.panSpeed = window.innerWidth <= 500 ? 0.25 : 0.5
      touchPanControl.noZoom = false
      touchPanControl.noPan = false
      touchPanControl.staticMoving = false
      touchPanControl.dynamicDampingFactor = 0.234

      let touchDragControl = this.touchDragControl = new THREE.DragDrag(this.dragGroup, camera, touchSurface)
      touchDragControl.addEventListener('dragstart', this.itemDragStart)
      touchDragControl.addEventListener('drag', this.itemDragging)
      touchDragControl.addEventListener('click', this.itemClickObj)
      touchDragControl.addEventListener('dragend', this.itemDragEnd)

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

      this.load()
    },
    load () {
      setTimeout(() => {
        this.root = MS.makeDemoRoot()
      }, 200)
    },
    itemDragStart (evt) {
      this.touchPanControl.enabled = false
      this.updatePos(evt)
    },
    itemDragging (evt) {
      let obj = evt.object
      let info = obj.userData.info

      this.nowPos.copy(info.pos)

      this.updatePos(evt)
    },
    itemClickObj (evt) {
      this.updatePos(evt)

      let obj = evt.object
      let info = obj.userData.info

      this.current.mesh = obj
      this.current.data = info
      this.refreshGUI()
    },
    itemDragEnd (evt) {
      this.touchPanControl.enabled = true
      let obj = evt.object
      let info = obj.userData.info

      this.$emit('pulse-update', { delta: info })
    },
    updatePos (evt) {
      let obj = evt.object
      let info = obj.userData.info
      // console.table([info])
      // console.table([obj.position])

      info.pos.x = obj.position.x
      info.pos.y = obj.position.y
      info.pos.z = obj.position.z
    }
  },
  mounted () {
    this.setup()
    var rAF = () => {
      this.runWebGL()
      this.rAFID = window.requestAnimationFrame(rAF)
    }
    this.rAFID = window.requestAnimationFrame(rAF)
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
.editor{
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  background-color: rgba(255,255,255,0.5);
}
.closer{
  position: fixed;
  top: 0px;
  left: 0px;
  background-color: rgba(0,0,0,0.2);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 1.0s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.tools{
  position: absolute;
  bottom: 20px;
  left: 20px;
}

.en-create-btns{
  position: absolute;
  top: 20px;
  left: 20px;
}

.en-edit-glsl{
  position: absolute;
  top: 0px;
  left: 0px;
  background-color: rgba(255,255,255,0.5);
  padding: 20px;
}

.en-edit-close{
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 20px;
}

.en-time-machine{
  position: absolute;
  bottom: 20px;
  left: 20px;
}

</style>
