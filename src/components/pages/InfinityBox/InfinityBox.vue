<template>
<div>
  <!-- Display -->

  <Mesh
    v-if="rtt"
    @attach="(v) => { $parent.$emit('add', v) }"
    @detach="(v) => { $parent.$emit('remove', v) }"
  >
    <PlaneBufferGeometry :width="viewport.width" :height="viewport.height" :nx="5" :ny="5"></PlaneBufferGeometry>
    <MeshBasicMaterial :color="0xffffff" :texture="rtt.texture"></MeshBasicMaterial>
  </Mesh>


  <!-- Content -->
  <RenderTarget
    :width="512"
    :height="512"
    @rtt="(v) => { rtt = v }"
  />
  <Scene v-if="rtt.texture" @scene="(v) => { sceneRTT = v; setup() }">

    <Object3D
      @element="(v) => {
        scroller = v
      }"
    >

      <Object3D
        :key="item.id"
        v-for="item in list"
      >

        <Text3DComp
          :fontSize="100"
          :fontFamily="'Arial'"
          :vs="null"
          :fs="null"

          :pos="{ x: 0, y: 0, z: 0 }"
          :transparent="true"
          :placeholder="'Click to edit me.'"
          :text="item.text + ''"
          :width="9000"
          @attach="(mesh) => { attachText({ mesh, info: item }) }"
          @detach="(mesh) => { detachText({ mesh }) }"
        />
      </Object3D>

    </Object3D>


  </Scene>
  <PerspectiveCamera
    :fov="75"
    :aspect="512 / 512"
    :near="1"
    :far="10000"
    :position="{ x: 0, y: 0, z: 60 }"
    @camera="(v) => { cameraRTT = v }"
  />


</div>
</template>

<script>
// import { DomToucher } from '@/components/Shared/Utils.js'
import { DomToucher, fullScreener } from '@/components/shared/tools.js'
import Text3DComp from '@/components/pages/Hello/Elements/Text/Text3DComp.vue'
import Bundle from '@/components/ThreeJS/Bundle.js'
/* eslint-disable */
import * as TWEEN from '@tweenjs/tween.js'
import * as THREE from 'three'
/* eslint-enable */

export default {
  components: {
    ...Bundle,
    Text3DComp
  },
  props: {
    touchSurface: {},
    list: {
      default () {
        return []
      }
    },
    renderer: {},
    size: {}
  },
  data () {
    return {
      layoutFn () {},
      viewport: {
        width: 30,
        height: 30
      },
      fullScreener,
      scroller: false,
      sceneRTT: false,
      rtt: false,
      rAFID: 0,
      camearRTT: false,
      group: [],
      meshes: []
    }
  },
  computed: {
  },
  created () {
  },
  methods: {
    runWebGL () {
      if (this.renderer && this.cameraRTT && this.sceneRTT && this.rtt) {
        this.renderer.render(this.sceneRTT, this.cameraRTT, this.rtt)
      }
    },
    setup () {
      let touchSurface = this.touchSurface
      let camera = this.cameraRTT

      var layoutFn = this.layoutFn = () => {
        this.$nextTick(() => {
          // var fs = this.fullScreener({ planeZ: 0, camera })
          this.meshes.forEach((mesh, key) => {
            var word = mesh.geometry.parameters.height
            var firstWord = word * 0.5
            var padding = 1.3
            mesh.position.y = this.viewport.height - firstWord - key * (word + padding)
          })
        })
      }
      layoutFn()
      window.addEventListener('resize', layoutFn, false)

      var sizer = {
        meshes: this.meshes,
        reduceMaxX: (accu, mesh, key) => {
          let length = Math.abs(mesh.position.x)
          if (length >= accu) {
            accu = length
          }
          return accu
        },
        reduceMaxY: (accu, mesh, key) => {
          let length = Math.abs(mesh.position.y) - this.viewport.height
          if (length >= accu) {
            accu = length
          }
          return accu
        },
        get totalX () {
          return this.meshes.reduce(this.reduceMaxX, 0)
        },
        get totalY () {
          return this.meshes.reduce(this.reduceMaxY, 0)
        }
      }

      // Using events with the custom object
      var mover = this.mover = new DomToucher({ toucher: touchSurface })

      // setTimeout(() => {
      //   if (this.fs) {
      //     // if 1 row
      //     if (this.fs.aspect <= 1) {
      //       // new TWEEN.Tween(this.scroller.position)
      //       //   .to({ x: -this.fs.width * 3 || -3.0 }, 2000)
      //       //   .easing(TWEEN.Easing.Quadratic.Out)
      //       //   .delay(1500)
      //       //   .start()

      //       new TWEEN.Tween(mover.state)
      //         .to({ deltaX: -0.5 }, 300)
      //         .easing(TWEEN.Easing.Quadratic.Out)
      //         .delay(1500)
      //         .onUpdate(() => {
      //           mover.state.inertia = 1.0
      //         })
      //         .start()
      //     }
      //   }
      // }, 3000)

      mover.addEventListener('update', (evt) => {
        // Scroll X
        let maxX = 0
        let minX = -sizer.totalX
        let maxY = sizer.totalY
        let minY = 0

        let moveAmountX = evt.state.inX * 0.25
        let moveAmountY = evt.state.inY * 0.15
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

          scroller.position.y += -moveAmountY - moveAmountX

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

        if (this.meshes) {
          this.meshes.forEach((mesh) => {
            var position = tempVec3.setFromMatrixPosition(mesh.matrixWorld)
            if (!(
              tempFrustum.containsPoint(position)
            )) {
              // this.tweenIndexZ(mesh, -5, 1)
              // mesh.visible = false
            } else {
              // this.tweenIndexZ(mesh, 0, 0)
              // mesh.visible = true
            }
          })
        }
      }

      // this.sceneRTT.background = new THREE.Color('hsl(261, 83%, 66%)')
    },
    attachText ({ mesh, info }) {
      mesh.userData = mesh.userData || {}
      mesh.userData.info = info
      this.meshes.push(mesh)
      this.group.push(mesh)
      this.layoutFn()
    },
    detachText ({ mesh }) {
      this.meshes.forEach((im, idx) => {
        if (mesh.uuid === im.uuid) {
          this.meshes.splice(idx, 1)
        }
      })
      this.group.forEach((im, idx) => {
        if (mesh.uuid === im.uuid) {
          this.group.splice(idx, 1)
        }
      })
    }
  },
  mounted () {
    var rAF = () => {
      this.runWebGL()
      this.rAFID = window.requestAnimationFrame(rAF)
    }
    this.rAFID = window.requestAnimationFrame(rAF)
  }
}
</script>

<style>

</style>
