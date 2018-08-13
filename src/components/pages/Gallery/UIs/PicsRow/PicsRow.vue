<template>
  <div>

    <Object3D
      @attach="(v) => { $parent.$emit('add', v) }"
      @detach="(v) => { $parent.$emit('remove', v) }"
    >
      <Object3D
        :sx="20.0"
        :sy="20.0"
        :sz="20.0"

        :px="pp.x * 0.03"
        :py="0.0"
        :pz="0.0"
      >
        <Object3D>
          <Points>
            <PlaneBufferGeometry :nx="192" :ny="192" />
            <ShaderMaterial :vs="simple.vs" :fs="simple.fs" :uniforms="animatable" />
          </Points>
        </Object3D>

        <Object3D :px="5.0 + 1.0">
          <Points>
            <PlaneBufferGeometry :nx="192" :ny="192" />
            <ShaderMaterial :vs="simple.vs" :fs="simple.fs" :uniforms="animatable" />
          </Points>
        </Object3D>

        <Object3D :px="(5.0 + 1.0) * 2.0">
          <Points>
            <PlaneBufferGeometry :nx="192" :ny="192" />
            <ShaderMaterial :vs="simple.vs" :fs="simple.fs" :uniforms="animatable" />
          </Points>
        </Object3D>

      </Object3D>

    </Object3D>

  </div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'
import * as THREE from 'three'
// import * as Leap from '@/components/pages/LeapMotion/Leap.js'

export default {
  props: {
    isCentered: {
      default: true
    },
    pick: {}
  },
  components: {
    ...Bundle
  },
  data () {
    var _ = this
    return {
      _,
      pp: {
        x: 0,
        y: 0,
        z: 0
      },
      THREE,
      animatable: {
        time: { value: 0 },
        isCentered: {
          get value () {
            return _.isCentered
          }
        }
      },
      simple: {
        vs: `

#include <common>

mat3 rotateX(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        1.0, 0.0, 0.0,
        0.0, c, s,
        0.0, -s, c
    );
}

mat3 rotateY(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        c, 0.0, -s,
        0.0, 1.0, 0.0,
        s, 0.0, c
    );
}

mat3 rotateZ(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        c, s, 0.0,
        -s, c, 0.0,
        0.0, 0.0, 1.0
    );
}

uniform float time;
varying vec3 vPos;

void main (void) {
  vec3 newPos = position + vec3(
    rand(position.xy + 0.1),
    rand(position.xy + 0.2),
    rand(position.xy + 0.3)
  ) * 0.05;

  // newPos = rotateZ(time + newPos.z * 1.5) * newPos;
  newPos.z += 0.3 * sin(newPos.y + time);

  // newPos = rotateX(3.14159265 * 0.5) * newPos;

  vPos = position;

  vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
  vec4 outputPos = projectionMatrix * mvPosition;
  gl_Position = outputPos;
  gl_PointSize = 1.0;
}
        `,
        fs: `
varying vec3 vPos;
uniform float time;
uniform bool isCentered;

void main () {
  if (isCentered) {
    gl_FragColor = vec4(vec3(1.0, 1.0, 1.0), 1.0);
  } else {
    gl_FragColor = vec4(vec3(0.1, 0.1, 0.1), 0.1);
  }
}
        `
      }
    }
  },
  methods: {
    update () {
      var time = window.performance.now() * 0.001
      this.animatable.time.value = time

      if (this.isCentered) {
        this.pp.x += this.pick.dpx * this.pick.in
      }

      // this.pp.y += this.pick.dpy * this.pick.in
      // this.pp.z += this.pick.dpz * this.pick.in

      this.pick.in *= 0.95

      // console.log(this.pp.x, this.pp.y, this.pp.z)
    },
    looper () {
      var self = this
      let rAFID = 0
      function loop () {
        rAFID = window.requestAnimationFrame(loop)
        self.update()
      }
      rAFID = window.requestAnimationFrame(loop)
      self.clean = () => {
        window.cancelAnimationFrame(rAFID)
      }
    }
  },
  mounted () {
    this.looper()
  },
  beforeDestroy () {
    this.clean()
  }
}
</script>

<style>

</style>
