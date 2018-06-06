<template>
<div class="full">
  <div class="full toucher" ref="touch-surface"></div>

  <Scene @scene="(v) => { $emit('scene', v); scene = v }">

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

import 'imports-loader?THREE=three!../../shared/Touch/TrackTrack.js'
import 'imports-loader?THREE=three!../../shared/Touch/DragDrag.js'

// import 'imports-loader?THREE=three!three/examples/js/controls/TrackBallControls.js'
// import 'imports-loader?THREE=three!./Touch/TrackTrack.js'
// import 'imports-loader?THREE=three!./Touch/DragDrag.js'
/* eslint-enable */

import Honey from './Honey'
import VField from './V-Field'
import Hello from '../Hello/Hello.vue'

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
    return {
      dragGroup: [],
      eGroup: [
        {
          pos: {x: 17, y: 0, z: 0},
          component: 'Honey',
          zIndex: 0.0,
          element: false,
          skip: false,
          size: {
            width: 512,
            height: 512 * 16 / 9,
            aspect: 1 * 1 / (16 / 9),
            vw: 15.0,
            vh: 15.0 * 16 / 9
          },
          shader: {
            vs:
    `
    #include <common>

    varying vec2 vUv;
    varying vec3 vPos;

    uniform float time;

    void main ( void ) {
      vec3 newPos = position;
      newPos.z += sin(newPos.y + time * 55.0) * 0.3;

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
              }
            }
          }
        },
        {
          pos: {x: 0, y: 0, z: 0},
          component: 'Hello',
          zIndex: 0.0,
          element: false,
          skip: false,
          size: {
            width: 512,
            height: 512 * 16 / 9,
            aspect: 1 * 1 / (16 / 9),
            vw: 15.0,
            vh: 15.0 * 16 / 9
          },
          shader: {
            vs:
    `
    #include <common>

    varying vec2 vUv;
    varying vec3 vPos;

    uniform float time;

    void main ( void ) {
      vec3 newPos = position;
      newPos.z += sin(newPos.y + time * 55.0) * 0.3;

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
              }
            }
          }
        },
        {
          pos: {x: 17 * 2, y: 0, z: 0},
          component: 'VField',
          zIndex: 0.0,
          element: false,
          skip: false,
          size: {
            width: 512,
            height: 512 * 16 / 9,
            aspect: 1 * 1 / (16 / 9),
            vw: 15.0,
            vh: 15.0 * 16 / 9
          },
          shader: {
            vs:
    `
    #include <common>

    varying vec2 vUv;
    varying vec3 vPos;

    uniform float time;

    void main ( void ) {
      vec3 newPos = position;
      newPos.z += sin(newPos.y + time * 55.0) * 0.3;

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
              }
            }
          }
        }
      ],
      TWEEN,
      touchPanControl: false,
      rAFID: 0,
      scene: false,
      camera: false,
      camPos: {
        x: 0, y: 0, z: 25
      }
    }
  },
  computed: {
  },
  methods: {
    runWebGL () {
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

      let touchPanControl = this.touchPanControl = new THREE.TrackTrack(camera, touchSurface)
      touchPanControl.rotateSpeed = 1.0
      touchPanControl.zoomSpeed = 1.0
      touchPanControl.panSpeed = window.innerWidth <= 512 ? 0.35 : 0.5
      touchPanControl.noZoom = false
      touchPanControl.noPan = false
      touchPanControl.staticMoving = false
      touchPanControl.dynamicDampingFactor = 0.234

      var tempMatrix = new THREE.Matrix4()
      var tempVec3 = new THREE.Vector3()
      var tempFrustum = new THREE.Frustum()
      this.renderCheck = () => {
        camera.updateMatrix()
        camera.updateMatrixWorld()
        tempFrustum.setFromMatrix(tempMatrix.identity().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse))

        if (this.eGroup) {
          this.eGroup.forEach((item) => {
            var position = tempVec3.setFromMatrixPosition(item.element.matrixWorld)
            if (!(
              tempFrustum.containsPoint(position)
            )) {
              item.skip = true
            } else {
              item.skip = false
            }
          })
          this.$forceUpdate()
        }
      }
      touchPanControl.addEventListener('end', this.renderCheck)

      // let touchDragControl = this.touchDragControl = new THREE.DragDrag(this.dragGroup, camera, touchSurface)
      // touchDragControl.addEventListener('dragstart', this.itemDragStart)
      // touchDragControl.addEventListener('drag', this.itemDragging)
      // touchDragControl.addEventListener('click', this.itemClickObj)
      // touchDragControl.addEventListener('dragend', this.itemDragEnd)

      this.scene.background = new THREE.Color(0xefefef)
    },
    tweenIndexZ (eItem, zIndex, t) {
      new TWEEN.Tween(eItem)
        .to({ zIndex }, 300)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
    },
    itemDragStart (evt) {
      this.eGroup.forEach((eItem, key) => {
        if (eItem.element.uuid === evt.object.uuid) {
          this.tweenIndexZ(eItem, 0)
        } else if (eItem.zIndex >= -this.eGroup.length) {
          this.tweenIndexZ(eItem, -1)
        }
      })

      this.$forceUpdate()
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
