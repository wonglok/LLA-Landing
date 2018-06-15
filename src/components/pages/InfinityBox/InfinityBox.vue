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
    :width="res.width"
    :height="res.height"
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
          :fontSize="40"
          :fontFamily="'\'InterUI\', \'Avenir\', Helvetica, Arial, sans-serif'"
          :vs="textShader.vs"
          :fs="textShader.fs"
          :textAlign="'left'"
          :pos="{ x: 0, y: 0, z: 0 }"
          :transparent="true"
          :placeholder="'Click to edit me.'"
          :text="item.text + ''"
          :width="res.width"
          @attach="(mesh) => { attachText({ mesh, info: item }) }"
          @detach="(mesh) => { detachText({ mesh }) }"
          @layout="(v) => { layoutFn(v) }"
        />

      </Object3D>

    </Object3D>


  </Scene>
  <PerspectiveCamera
    :fov="75"
    :aspect="res.width / res.height"
    :near="1"
    :far="10000"
    :position="{ x: 0, y: 0, z: 10 }"
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
    size: {},
    group: {
      default () {
        return []
      }
    }
  },
  data () {
    return {
      fs: false,
      layoutFn () {},
      viewport: {
        width: 30,
        height: 30
      },
      res: {
        width: 512,
        height: 512
      },
      fullScreener,
      scroller: false,
      sceneRTT: false,
      rtt: false,
      rAFID: 0,
      camearRTT: false,
      meshes: [],
      textShader: {
        vs: `// varying vec3 vPos;
uniform float time;
varying vec2 vUv;

void main (void) {
  vec3 nPos = position;

  nPos.z += sin(time * 4.0 + nPos.x) * 0.25;
  nPos.z += sin(time * 4.0 + nPos.y) * 0.25;

  vUv = uv;

  vec4 mvPosition = modelViewMatrix * vec4(nPos, 1.0);
  vec4 outputPos = projectionMatrix * mvPosition;
  gl_Position = outputPos;
  gl_PointSize = 1.0;
}`,
        fs: `// varying vec3 vPos;
varying vec2 vUv;

uniform float time;
uniform sampler2D text;
uniform sampler2D pattern;

void patternText (vec4 textColor) {
  vec2 swifting = vUv;
  swifting.x = swifting.x + time * 0.3;
  swifting.x = fract(swifting.x);

  swifting.y = swifting.y + time * 0.3;
  swifting.y = fract(swifting.y);
  vec4 pattern = texture2D(pattern, swifting);

  vec3 final = vec3((1.0 - textColor) * (pattern.rrra));
  gl_FragColor = vec4(vec3(final), textColor.a);
}

void emoji (vec4 textColor) {
  gl_FragColor = textColor;
}

void main () {
  vec4 textColor = texture2D(text, vUv);

  if (textColor.a > 0.1 && textColor.r < 0.01) {
    patternText(textColor);
  } else if (textColor.a > 0.1) {
    emoji(textColor);
  } else {
    discard;
  }
}
`
      }
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

      var layoutFn = this.layoutFn = ({ width, height, mesh }) => {
        this.$nextTick(() => {
          var fs = this.fs = this.fullScreener({ planeZ: 0, camera: this.cameraRTT })
          this.meshes.forEach((iMesh, key) => {
            var eachWord = iMesh.geometry.parameters.height
            // var padding = 3.3
            iMesh.position.y = fs.height * 0.5 - eachWord * 0.5 - key * eachWord
          })
        })
      }
      window.addEventListener('resize', layoutFn, false)

      //
      this.fs = this.fullScreener({ planeZ: 0, camera: this.cameraRTT })

      var sizer = {
        meshes: this.meshes,
        reduceMaxX: (accu, mesh, key) => {
          let length = Math.abs(mesh.position.x) - (this.fs.height * 0.5) + this.meshes[this.meshes.length - 1].geometry.parameters.height * 0.5
          if (length >= accu) {
            accu = length
          }
          return accu
        },
        reduceMaxY: (accu, mesh, key) => {
          let length = Math.abs(mesh.position.y) - (this.fs.height * 0.5) + this.meshes[this.meshes.length - 1].geometry.parameters.height * 0.5
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

      setTimeout(() => {
        new TWEEN.Tween(mover.state)
          .to({ deltaX: -1.0 }, 300)
          .easing(TWEEN.Easing.Quadratic.Out)
          .delay(1500)
          .onUpdate(() => {
            mover.state.inertia = 1.0
          })
          .start()
      }, 0)

      mover.addEventListener('update', (evt) => {
        // Scroll X
        let maxX = 0
        let minX = -sizer.totalX
        let maxY = sizer.totalY
        let minY = 0

        let moveAmountX = evt.state.inX * 0.35
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

          scroller.position.y += -moveAmountY - moveAmountX

          if (scroller.position.x > maxX) {
            let varying = { ...scroller.position }
            varying.x -= (varying.x - maxX) * 0.35
            scroller.position.copy(varying)
          }
          if (scroller.position.x < minX) {
            let varying = { ...scroller.position }
            varying.x -= (varying.x - minX) * 0.35
            scroller.position.copy(varying)
          }

          if (scroller.position.y > maxY) {
            let varying = { ...scroller.position }
            varying.y -= (varying.y - maxY) * 0.35
            scroller.position.copy(varying)
          }
          if (scroller.position.y < minY) {
            let varying = { ...scroller.position }
            varying.y -= (varying.y - minY) * 0.35
            scroller.position.copy(varying)
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
