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

    <Object3D @element="(v) => {
      scroller = v
    }"
    :pz="-5">

      <Object3D
        :key="egIDX"
        v-for="(eGroupItem, egIDX) in eGroup"
        :pz="eGroupItem.zIndex * 1.75"
      >
        <Mesh
          :position="eGroupItem.pos"
          @attach="(v) => { eGroupItem.element = v; v.userData.info = eGroupItem; }"
        >
          <PlaneBufferGeometry :width="eGroupItem.size.vw" :height="eGroupItem.size.vh" :nx="64" :ny="64"></PlaneBufferGeometry>
          <ShaderMaterial :vs="eGroupItem.shader.vs" :fs="eGroupItem.shader.fs" :uniforms="eGroupItem.shader.uniforms">
            <RenderTarget
              @texture="(v) => { eGroupItem.shader.uniforms.tDiffuse.value = v; }"
              :width="eGroupItem.size.width"
              :height="eGroupItem.size.height"
            >
              <Component
                :is="eGroupItem.component"
                v-if="renderer && eGroupItem.shader.uniforms.tDiffuse.value"
                :skip="eGroupItem.skip"
                :renderer="renderer"
                :size="{
                  width: eGroupItem.size.width,
                  height: eGroupItem.size.height,
                  aspect: eGroupItem.size.aspect
                }"
                :touchSurface="$refs['touch-surface']"
                @texture="(v) => { eGroupItem.shader.uniforms.tDiffuse.value = v; }"
              />
            </RenderTarget>
          </ShaderMaterial>
        </Mesh>
      </Object3D>
    </Object3D>

    <Object3D :pz="0.0">
      <TextOutlet ref="text-outlet" v-if="root" :root="root" :group="dragGroup" />
    </Object3D>

  </Scene>


  <PerspectiveCamera
    :fov="75"
    :aspect="size.aspect"
    :near="1"
    :far="10000"
    :position="camPos"
    @camera="(v) => { $emit('camera', v); camera = v; }"
  />

</div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'
/* eslint-disable */
import * as TWEEN from '@tweenjs/tween.js'
import * as THREE from 'three'

import { fullScreener, DomToucher } from './Utils.js'

import 'imports-loader?THREE=three!../../shared/Touch/TrackTrack.js'
import 'imports-loader?THREE=three!../../shared/Touch/DragDrag.js'

// import 'imports-loader?THREE=three!three/examples/js/controls/TrackBallControls.js'
// import 'imports-loader?THREE=three!./Touch/TrackTrack.js'
// import 'imports-loader?THREE=three!./Touch/DragDrag.js'
/* eslint-enable */

import Honey from './Honey'
import VField from './V-Field'
import Hello from '../Hello/Hello.vue'

import * as MS from '../Hello/Data/HelloData.js'
import TextOutlet from '../Hello/Elements/Text/TextOutlet.vue'
import TextEdit from '../Hello/Elements/Text/TextEdit.vue'

// // Using events with the custom object
// var mover = new DomToucher({ toucher: window })

// mover.addEventListener('start', (evt) => {
//   // alert(event.message)
//   console.log(evt.message)
// })

export default {
  components: {
    ...Bundle,
    Honey,
    Hello,
    VField,
    TextOutlet,
    TextEdit
  },
  props: {
    renderer: {},
    size: {}
  },
  data () {
    var dpi = 2

    var eGroup = [
      {
        pos: {x: 0, y: 0, z: 0},
        component: 'Hello',
        zIndex: 0.0,
        element: false,
        skip: false,
        size: {
          width: 256 * dpi,
          height: 256 * dpi * 16 / 9,
          aspect: 1 * 1 / (16 / 9),
          vw: 18.0,
          vh: 18.0 * 16 / 9
        },
        shader: {
          vs:
  `
  #include <common>

  varying vec2 vUv;
  varying vec3 vPos;

  uniform float time;
  uniform float wiggle;

  void main ( void ) {
    vec3 newPos = position;
    newPos.y += sin(time * 55.0) * wiggle;

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
  uniform sampler2D tDiffuse;

  void main () {
    vec4 tColor = texture2D(tDiffuse, vUv);
    gl_FragColor = tColor;
  }
  `,
          uniforms: {
            tDiffuse: {
              value: null
            },
            time: {
              value: 0
            },
            wiggle: {
              value: 0
            }
          }
        }
      },

      {
        pos: {x: 20, y: 0, z: 0},
        component: 'Honey',
        zIndex: 0.0,
        element: false,
        skip: false,
        size: {
          width: 256 * dpi,
          height: 256 * dpi * 16 / 9,
          aspect: 1 * 1 / (16 / 9),
          vw: 18.0,
          vh: 18.0 * 16 / 9
        },
        shader: {
          vs:
  `
  #include <common>

  varying vec2 vUv;
  varying vec3 vPos;

  uniform float time;
  uniform float wiggle;

  void main ( void ) {
    vec3 newPos = position;
    newPos.y += sin(time * 55.0) * wiggle;

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
  uniform sampler2D tDiffuse;

  void main () {
    vec4 tColor = texture2D(tDiffuse, vUv);
    gl_FragColor = tColor;
  }
  `,
          uniforms: {
            tDiffuse: {
              value: null
            },
            time: {
              value: 0
            },
            wiggle: {
              value: 0
            }
          }
        }
      },

      {
        pos: {x: 20 * 2, y: 0, z: 0},
        component: 'VField',
        zIndex: 0.0,
        element: false,
        skip: false,
        size: {
          width: 256 * dpi,
          height: 256 * dpi * 16 / 9,
          aspect: 1 * 1 / (16 / 9),
          vw: 18.0,
          vh: 18.0 * 16 / 9
        },
        shader: {
          vs:
  `
  #include <common>

  varying vec2 vUv;
  varying vec3 vPos;

  uniform float time;
  uniform float wiggle;

  void main ( void ) {
    vec3 newPos = position;
    newPos.y += sin(time * 55.0) * wiggle;

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
  uniform sampler2D tDiffuse;

  void main () {
    vec4 tColor = texture2D(tDiffuse, vUv);
    gl_FragColor = tColor;
  }
  `,
          uniforms: {
            tDiffuse: {
              value: null
            },
            time: {
              value: 0
            },
            wiggle: {
              value: 0
            }
          }
        }
      }
    ]

    return {
      scroller: false,

      // text outlet
      MS,
      // touchSurface: false,
      mode: 'SceneEdit',
      dragGroup: [],
      current: {
        mesh: false,
        data: false
      },
      root: false,
      tempv3: new THREE.Vector3(),
      nowPos: new THREE.Vector3(),

      eGroup,
      TWEEN,
      touchPanControl: false,
      rAFID: 0,
      scene: false,
      camera: false,
      camPos: {
        x: 0, y: 0, z: 45
      },
      tGroup: new TWEEN.Group()
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
    },
    runWebGL () {
      this.tGroup.update()
      TWEEN.update()
      if (this.touchPanControl) {
        this.touchPanControl.update()
      }

      this.eGroup.forEach((ei) => {
        ei.shader.uniforms.time.value = window.performance.now() * 0.0001
      })

      if (this.renderer && this.camera && this.scene) {
        this.renderer.render(this.scene, this.camera)
      }
    },
    setup () {
      let touchSurface = this.touchSurface = this.$refs['touch-surface']
      let camera = this.camera

      // Using events with the custom object
      var mover = this.mover = new DomToucher({ toucher: touchSurface })

      mover.addEventListener('update', (evt) => {
        // alert(event.message)
        // console.log(evt.state)
        let max = 0
        let min = -this.eGroup.reduce((accu, eg, key) => {
          let length = eg.size.vw * key

          if (length >= accu) {
            accu = length
          }

          return accu
        }, 0)

        let moveAmount = evt.state.inX * 0.25 + evt.state.inY * 0.15

        let scroller = this.scroller
        if (scroller) {
          scroller.position.x += moveAmount

          if (scroller.position.x > max) {
            let varying = { ...scroller.position }
            varying.x -= (varying.x - max) * 0.35
            scroller.position.set(varying.x, varying.y, varying.z)
          }
          if (scroller.position.x < min) {
            let varying = { ...scroller.position }
            varying.x -= (varying.x - min) * 0.35
            scroller.position.set(varying.x, varying.y, varying.z)
          }
        }
      })

      mover.addEventListener('throttledSim', (evt) => {
        this.viewCheck()
      })

      mover.addEventListener('end', (evt) => {
        this.viewCheck()
      })

      var tempMatrix = new THREE.Matrix4()
      var tempVec3 = new THREE.Vector3()
      var tempFrustum = new THREE.Frustum()

      this.viewCheck = () => {
        camera.updateMatrix()
        camera.updateMatrixWorld()
        tempFrustum.setFromMatrix(tempMatrix.identity().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))

        if (this.eGroup) {
          this.eGroup.forEach((item) => {
            var position = tempVec3.setFromMatrixPosition(item.element.matrixWorld)
            if (!(
              tempFrustum.containsPoint(position)
            )) {
              // this.tweenIndexZ(item, -5, 1)
              item.skip = true
            } else {
              // this.tweenIndexZ(item, 0, 0)
              item.skip = false
            }
          })
        }
      }

      var layoutFn = () => {
        this.$nextTick(() => {
          var fs = this.fs = fullScreener({ planeZ: -5, camera })

          this.eGroup.forEach((eg, key) => {
            var sizer = 1.0
            var dpi = 2

            eg.size.vw = fs.width * sizer
            if (fs.aspect > 1) {
              eg.size.vw = fs.vmin
            }
            eg.size.vh = fs.height * 1.0
            eg.size.aspect = eg.size.vw / eg.size.vh

            eg.size.width = 768 * eg.size.aspect * dpi
            eg.size.height = 768 * dpi

            eg.element.position.x = eg.size.vw * sizer * (key)
          })

          this.viewCheck()
        })
      }
      layoutFn()
      window.addEventListener('resize', layoutFn, false)

      // // ----------
      // // Clicker
      // var raycaster = this.raycaster = new THREE.Raycaster()
      // var mouse = new THREE.Vector2()

      // var onMouseMove = (event) => {
      //   mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      //   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      // }
      // touchSurface.addEventListener('mousemove', onMouseMove, false)

      // var onTouchMove = (evt) => {
      //   if (evt.type === 'touchmove' || evt.type === 'touchstart') {
      //     mouse.x = (evt.touches[0].pageX / window.innerWidth) * 2 - 1
      //     mouse.y = -(evt.touches[0].pageY / window.innerHeight) * 2 + 1
      //   }
      // }
      // touchSurface.addEventListener('touchstart', onTouchMove, false)
      // touchSurface.addEventListener('touchend', onTouchMove, false)
      // touchSurface.addEventListener('touchmove', onTouchMove, false)

      // var onClick = () => {
      //   raycaster.setFromCamera(mouse, camera)
      //   // calculate objects intersecting the picking ray
      //   var evt = raycaster.intersectObjects(this.dragGroup)[0]
      //   if (evt) {
      //     this.bringIn(evt)
      //   }
      // }
      // window.document.documentElement.addEventListener('click', onClick, false)

      let touchPanControl = this.touchPanControl = new THREE.TrackTrack(camera, touchSurface)
      touchPanControl.rotateSpeed = 1.0
      touchPanControl.zoomSpeed = 1.0
      touchPanControl.panSpeed = window.innerWidth <= 500 ? 0.25 : 0.5
      touchPanControl.noZoom = true
      touchPanControl.noPan = true
      touchPanControl.staticMoving = false
      touchPanControl.dynamicDampingFactor = 0.234

      let touchDragControl = this.touchDragControl = new THREE.DragDrag(this.dragGroup, camera, touchSurface)
      touchDragControl.addEventListener('dragstart', this.itemDragStart)
      touchDragControl.addEventListener('drag', this.itemDragging)
      touchDragControl.addEventListener('click', this.itemClickObj)
      touchDragControl.addEventListener('dragend', this.itemDragEnd)

      this.scene.background = new THREE.Color(0xefefef)

      this.load()
    },
    bringIn (evt) {
      this.eGroup.forEach((eItem, key) => {
        if (eItem.element.uuid === evt.object.uuid) {
          // this.tweenIndexZ(eItem, 0)

          new TWEEN.Tween(this.camera.position, this.tGroup)
            .to({ x: eItem.element.position.x }, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start()

          this.mover.state.deltaX = 0
          this.mover.state.deltaY = 0

          eItem.skip = false
        } else if (eItem.zIndex >= -this.eGroup.length) {
          // this.tweenIndexZ(eItem, -2)
          eItem.skip = true
        }
      })

      this.$forceUpdate()
    }
  },
  mounted () {
    this.setup()
    var rAF = () => {
      this.rAFID = window.requestAnimationFrame(rAF)
      this.runWebGL()
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
