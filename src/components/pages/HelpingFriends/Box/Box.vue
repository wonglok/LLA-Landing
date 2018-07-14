<template>
  <div>

    <Object3D
    @attach="(v) => { $parent.$emit('add', v); box = v }"
    @detach="(v) => { $parent.$emit('remove', v); box = false }"

    v-if="scl.state" :rx="0.0" :px="0" :py="0.0" :pz="0">
      <Points @element="(v) => { v.frustumCulled = false; }">
        <BoxBufferGeometry  />
        <ShaderMaterial :vs="simple.vs" :fs="simple.fs" :uniforms="animatable" />
      </Points>
    </Object3D>

  </div>
</template>

<script>
import Bundle from '@/components/ThreeJS/Bundle.js'
import * as THREE from 'three'

export default {
  components: {
    ...Bundle
  },
  props: {
    scl: {}
  },
  data () {
    return {
      box: false,
      THREE,
      simple: {
        vs: `
varying vec3 vPos;
uniform float time;

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

void main (void) {
  vec3 newPos = position;
  newPos.x += tan(newPos.x * 10.0 + time);
  newPos.y += tan(newPos.y * 10.0 + time);

  newPos = rotateZ(time) * newPos;

  vPos = position;

  vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
  vec4 outputPos = projectionMatrix * mvPosition;
  gl_Position = outputPos;
  gl_PointSize = 1.0;
}
        `,
        fs: `
varying vec3 vPos;

void main () {
  gl_FragColor = vec4(vec3(1.0 - vPos), 1.0);
}
        `
      },
      PI: Math.PI,
      animatable: {
        time: { value: 0 }
      }
    }
  },
  mounted () {
    var self = this
    function loop () {
      self.rAFID = window.requestAnimationFrame(loop)
      self.updateAnimatable()
    }
    self.rAFID = window.requestAnimationFrame(loop)
  },
  methods: {
    updateAnimatable () {
      this.animatable.time.value = window.performance.now() * 0.0001
      if (this.box) {
        this.box.rotation.x = this.scl.state.progress * Math.PI * 2.0
      }
    }
  }
}
</script>

<style>

</style>
