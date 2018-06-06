<template>
<div class="full">
  <div class="full toucher" ref="touch-surface"></div>

  <Scene @scene="(v) => { $emit('scene', v); scene = v }">

    <Object3D @element="(v) => {
      scroller = v
    }">
      <Object3D
        :key="egIDX"
        v-for="(eGroupItem, egIDX) in eGroup"
        :pz="eGroupItem.zIndex * 1.75"
      >
        <Mesh
          :position="eGroupItem.pos"
          @attach="(v) => { eGroupItem.element = v; v.userData.info = eGroupItem; dragGroup.push(v); }"
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
                @texture="(v) => { eGroupItem.shader.uniforms.tDiffuse.value = v; }"
              />
            </RenderTarget>
          </ShaderMaterial>
        </Mesh>
      </Object3D>
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
import { EventDispatcher } from 'three/src/core/EventDispatcher.js'

import 'imports-loader?THREE=three!../../shared/Touch/TrackTrack.js'
import 'imports-loader?THREE=three!../../shared/Touch/DragDrag.js'

// import 'imports-loader?THREE=three!three/examples/js/controls/TrackBallControls.js'
// import 'imports-loader?THREE=three!./Touch/TrackTrack.js'
// import 'imports-loader?THREE=three!./Touch/DragDrag.js'
/* eslint-enable */

import Honey from './Honey'
import VField from './V-Field'
import Hello from '../Hello/Hello.vue'

var fullScreener = ({ planeZ, camera }) => {
  var cameraZ = camera.position.z
  var distance = cameraZ - planeZ
  var aspect = window.innerWidth / window.innerHeight
  var vFov = camera.fov * Math.PI / 180
  var planeHeightAtDistance = 2 * Math.tan(vFov / 2) * distance
  var planeWidthAtDistance = planeHeightAtDistance * aspect
  /*
  let dist = camera.position.z - mesh.position.z
  let height = ... // desired height to fit
  camera.fov = 2 * Math.atan(height / (2 * dist)) * (180 / Math.PI)
  camera.updateProjectionMatrix()
  */
  return {
    aspect: planeWidthAtDistance / planeHeightAtDistance,
    vmin: Math.min(planeWidthAtDistance, planeHeightAtDistance),
    vmax: Math.max(planeWidthAtDistance, planeHeightAtDistance),
    width: planeWidthAtDistance,
    height: planeHeightAtDistance
  }
}

function DomToucher ({ toucher }) {
  this.toucher = toucher
  var ui = this.state = {
    disabled: false,
    deltaX: -0.0,
    deltaY: -0.0,
    addon: 0.0016667,
    mass: 5.0,
    inertia: 1.0,
    inc: 0,
    aX: 0,
    aY: 0,
    inX: 0,
    inY: 0,
    isMD: false,

    _: {
      tsTheta: 0,
      tsX: 0,
      tsY: 0
    },
    throttleID: 0
  }
  var update = { type: 'update', state: this.state }
  var end = { type: 'end', state: this.state }
  var click = { type: 'click', state: this.state }
  var throttledSim = { type: 'throttledSim', state: this.state }
  var loop = { type: 'loop', state: this.state }
  this.onWHL = (evt) => {
    if (ui.disabled) { return }
    evt.preventDefault()

    ui.deltaX = -event.deltaX * 0.02
    ui.deltaY = -event.deltaY * 0.02

    // if (event.deltaX) {
    //   ui.deltaTheta = -event.deltaX * 0.02 / (Math.PI * 2)
    // }
    // if (event.deltaY) {
    //   ui.deltaTheta = -event.deltaY * 0.02 / (Math.PI * 2)
    // }

    // initia speed
    ui.inertia = ui.mass
  }

  this.onMD = (evt) => {
    ui.isMD = true
    onPanStart(evt)
  }
  this.onMU = (evt) => {
    ui.isMD = false
    onPanEnd(evt)
  }

  var onPointerMove = (ppp) => {
    ui.pX = ppp.clientX
    ui.pY = ppp.clientY
    ui.cX = (ui.pX / ui.conW) * 2 - 1
    ui.cY = (ui.pY / ui.conH) * 2 - 1

    if (ui.conW >= ui.conH) {
      let a = ui.conW / ui.conH
      ui.cX = ui.cX * a
      ui.cY = ui.cY
    } else {
      let a = ui.conH / ui.conW
      ui.cX = ui.cX
      ui.cY = ui.cY * a
    }
  }
  // pan around
  var onPanStart = (t1) => {
  // var t1 = touch[0]
  // var x = t1.pageX
  // var y = t1.pageY
    var x = t1.clientX
    var y = t1.clientY

    // ui.cX = (x / window.innerWidth) * 2 - 1
    // ui.cY = (y / window.innerHeight) * 2 - 1

    // var w = ui.conW
    // var h = ui.conH
    // var cX = (x - (w / 2)) / w
    // var cY = (y - (h / 2)) / h
    // var theta = Math.atan2(cY, cX)

    // pan
    ui._.tsX = x
    ui._.tsY = y

    // ui.inertia *= 0.05
    ui.isIn = true
  }

  var onPanMove = (t1) => {
    // var t1 = touch[0]
    // var x = t1.pageX
    // var y = t1.pageY
    var x = t1.clientX
    var y = t1.clientY

    // ui.cX = (x / window.innerWidth) * 2 - 1
    // ui.cY = (y / window.innerHeight) * 2 - 1

    //
    ui.deltaX = (x - ui._.tsX) * 0.05
    ui.deltaY = (y - ui._.tsY) * 0.05

    ui._.tsX = x
    ui._.tsY = y

    ui.aX += ui.deltaX
    ui.aY += ui.deltaY

    ui.inertia = ui.mass
  }

  var onPanEnd = (t1) => {
    ui.isIn = false
  }

  this.onMM = (evt) => {
    if (ui.disabled) { return }
    onPointerMove(evt)
  }
  this.onTS = (evt) => {
    if (ui.disabled) { return }
    // console.log(evt)
    // evt.target.style.outline = 'red solid 3px'
    // if (evt.target === toucher) {
    //   evt.preventDefault()
    // }
    var t = evt.touches
    if (t.length >= 1) {
      onPanStart(t[0])
      // onThetaStart(t[0])
    }
    ui.touches = t.length
  }
  this.onTM = (evt) => {
    if (ui.disabled) { return }
    evt.preventDefault()
    var t = evt.touches

    if (t.length >= 1) {
      onPanMove(t[0])
      // onThetaMove(t[0])
      onPointerMove(t[0])
    }
  }
  this.onTE = (evt) => {
    if (ui.disabled) { return }
    // evt.preventDefault()
    var t = evt.touches

    if (t.length === 1) {
      onPanEnd(t[0])
      this.dispatchEvent(click)
    }
    ui.touches = t.length
  }
  this.onResize = () => {
    ui.conW = toucher.clientWidth
    ui.conH = toucher.clientHeight
  }
  var sim = () => {
    if (ui.disabled) { return }
    ui.inc += ui.addon
    if (ui.inertia > 0.01) {
      //
      ui.inX = (ui.deltaX * ui.inertia)
      ui.inY = (ui.deltaY * ui.inertia)
      ui.aX += ui.inX
      ui.aY += ui.inY

      //
      // ui.inTheta = ((ui.deltaTheta * ui.inertia) * 0.45)
      // ui.aTheta += ui.inTheta

      // inertia
      ui.inertia *= 0.98

      ui.canFireEnd = true
      this.dispatchEvent(update)
    }
    if (ui.inertia < 0.9 && ui.canFireEnd) {
      ui.canFireEnd = false
      this.dispatchEvent(end)
    }

    this.dispatchEvent(loop)
    ui.throttleID++
    if (ui.throttleID % 16 === 0) {
      this.dispatchEvent(throttledSim)
    }
  }
  this.setup = () => {
    var rAFID = 0
    var rAF = () => {
      rAFID = window.requestAnimationFrame(rAF)
      sim()
    }
    rAFID = window.requestAnimationFrame(rAF)

    this.onResize()

    toucher.addEventListener('mousedown', this.onMD, false)
    toucher.addEventListener('mousemove', this.onMM, false)
    toucher.addEventListener('mouseup', this.onMU, false)

    toucher.addEventListener('touchstart', this.onTS, false)
    toucher.addEventListener('touchmove', this.onTM, false)
    toucher.addEventListener('touchend', this.onTE, false)

    window.addEventListener('wheel', this.onWHL, false)
    window.addEventListener('resize', this.onResize, false)

    return {
      clean: () => {
        toucher.removeEventListener('mousemove', this.onMM)
        toucher.removeEventListener('mousedown', this.onMD)
        toucher.removeEventListener('mouseup', this.onMU)

        toucher.removeEventListener('touchstart', this.onTS)
        toucher.removeEventListener('touchmove', this.onTM)
        toucher.removeEventListener('touchend', this.onTE)

        window.removeEventListener('wheel', this.onWHL)

        window.removeEventListener('resize', this.onResize)
        window.cancelAnimationFrame(rAFID)
      }
    }
  }

  var { clean } = this.setup()
  this.clean = clean
}

// Mixing the EventDispatcher.prototype with the custom object prototype
Object.assign(DomToucher.prototype, EventDispatcher.prototype)

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
    VField
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
      dragGroup: [],
      eGroup,
      TWEEN,
      touchPanControl: false,
      rAFID: 0,
      scene: false,
      camera: false,
      camPos: {
        x: 0, y: 0, z: 25
      },
      tGroup: new TWEEN.Group()
    }
  },
  computed: {
  },
  methods: {
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
            varying.x -= (varying.x - max) * 0.5
            scroller.position.set(varying.x, varying.y, varying.z)
          }
          if (scroller.position.x < min) {
            let varying = { ...scroller.position }
            varying.x -= (varying.x - min) * 0.5
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
          var fs = this.fs = fullScreener({ planeZ: 0, camera })

          this.eGroup.forEach((eg, key) => {
            var sizer = 1.0
            var dpi = 2

            eg.size.vw = fs.width * sizer
            eg.size.vh = fs.height * 1.0
            eg.size.aspect = eg.size.vw / eg.size.vh

            eg.size.width = 768 * eg.size.aspect * dpi
            eg.size.height = 768 * dpi

            eg.element.position.x = fs.width * sizer * (key)
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

      // let touchPanControl = this.touchPanControl = new THREE.TrackTrack(camera, touchSurface)
      // touchPanControl.rotateSpeed = 1.0
      // touchPanControl.zoomSpeed = 1.0
      // touchPanControl.panSpeed = window.innerWidth <= 256 * 512 ? 0.35 : 0.7
      // touchPanControl.noZoom = false
      // touchPanControl.noPan = false
      // touchPanControl.staticMoving = false
      // touchPanControl.dynamicDampingFactor = 0.234
      // touchPanControl.addEventListener('end', this.viewCheck)

      // let touchDragControl = this.touchDragControl = new THREE.DragDrag(this.dragGroup, camera, touchSurface)
      // touchDragControl.addEventListener('dragstart', this.itemDragStart)
      // touchDragControl.addEventListener('drag', this.itemDragging)
      // touchDragControl.addEventListener('click', this.itemClickObj)
      // touchDragControl.addEventListener('dragend', this.itemDragEnd)

      this.scene.background = new THREE.Color(0xefefef)
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
    },
    itemDragStart (evt) {
      this.touchPanControl.enabled = false
      // this.updatePos(evt)
    },
    itemDragging (evt) {
      // let obj = evt.object
      // let info = obj.userData.info

      // this.nowPos.copy(info.pos)

      this.updatePos(evt)
    },
    itemClickObj (evt) {
      this.updatePos(evt)

      // let obj = evt.object
      // let info = obj.userData.info

      // this.current.mesh = obj
      // this.current.data = info
      // this.refreshGUI()
    },
    itemDragEnd (evt) {
      this.renderCheck()
      this.touchPanControl.enabled = true

      console.log(evt.object.position)

      // let obj = evt.object
      // let info = obj.userData.info

      // this.$emit('pulse-update', { delta: info })
    },
    updatePos (evt) {
      // evt

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
</style>
