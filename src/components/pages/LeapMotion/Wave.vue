<template>
  <div></div>
</template>

<script>
import * as THREE from 'three'

/* eslint-disable */
import GPUComputationRenderer from '@/components/ThreeJS/System/GPUComputationRenderer.js'
/* eslint-enable */

// var TWEEN = require('@tweenjs/tween.js')

export default {
  props: {
    mouse: {},
    renderer: {}
  },
  data () {
    return {
      points: false
    }
  },
  watch: {
    mouse ({ x, y, z }) {
      this.mouseUpdater({ x, y, z })
    }
  },
  mounted () {
    let renderer = this.renderer
    function prepIndexer (texture, SIZE) {
      var pixels = texture.image.data
      var p = 0
      let max = SIZE * SIZE
      for (var j = 0; j < max; j++) {
        pixels[p + 0] = j
        pixels[p + 1] = j / (max)
        pixels[p + 2] = SIZE
        pixels[p + 3] = 1.0
        p += 4
      }
    }

    var ticker = 0
    let SIZE = 192

    var gpuCompute = new GPUComputationRenderer(SIZE, SIZE, renderer)

    var indexerTexture = gpuCompute.createTexture()
    prepIndexer(indexerTexture, SIZE)

    var pingTarget = gpuCompute.createRenderTarget()
    var pongTarget = gpuCompute.createRenderTarget()

    let pingMat, pongMat

    let displayV = `uniform sampler2D posTex;
    uniform float pointSize;
    uniform sampler2D indexerTexture;

    varying vec2 vUv;

    uniform float time;

    void main() {
        vec4 info = texture2D(indexerTexture, uv);

        vec4 pos = texture2D(posTex, uv);

        vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.0);
        vec4 outputPos = projectionMatrix * mvPosition;

        // outputPos.y = outputPos.y + sin(outputPos.y + time * 50.0) * sin(outputPos.y + time * 50.0);
        // outputPos.x = outputPos.x + cos(outputPos.x + time * 50.0) * sin(outputPos.x + time * 50.0);

        vUv = uv;

        gl_Position = outputPos;
        gl_PointSize = pointSize;
    }
    `

    let displayF = `
    #include <common>

    // uniform sampler2D posTex;

    uniform sampler2D picture;
    uniform float opacity;

    uniform float time;

    varying vec2 vUv;

    uniform vec3 mouse;

    void main() {
        // vec4 posColor = texture2D(posTex, vUv);

        vec4 imgColor = texture2D(picture, vUv);

        vec4 outputColor = imgColor;
        // outputColor.a = outputColor.a * opacity;

        // outputColor.xyz *= posColor.xyz;

        // outputColor.rgb = mix(outputColor.rgb + 0.2, vec3(1.0), smoothstep(0.0, 1.0, abs(sin(time * 5.0))));

        outputColor.rgb =
        vec3(
          rand(vUv.xy + .1),
          rand(vUv.xy + .2),
          rand(vUv.xy + .3)
        ) * 0.2 + 0.50 + abs(mouse) * 0.0133;

        outputColor.rbg *= 0.3 + vec3(
          rand(vUv.xy + .1),
          rand(vUv.xy + .2),
          rand(vUv.xy + .3)
        );

        //  +
        // 0.5 * vec3(
        //   244.0 / 255.0,
        //   174.0 / 255.0,
        //   11.0 / 255.0
        // );

        // outputColor.rgb *= outputColor.rgb;

        outputColor.a = opacity;

        gl_FragColor = outputColor;
    }
    `
    var defaultPingPong = `
//
//THANK YOU for your support <3
//

#include <common>
precision highp sampler2D;

//
//  Classic Perlin 3D Noise
//  by Stefan Gustavson
//

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 *
      vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

#define M_PI 3.1415926535897932384626433832795
float atan2(in float y, in float x) {
  bool xgty = (abs(x) > abs(y));
  return mix(M_PI/2.0 - atan(x,y), atan(y,x), float(xgty));
}

vec3 ballify (vec3 pos, float r) {
  float az = atan2(pos.y, pos.x);
  float el = atan2(pos.z, sqrt(pos.x * pos.x + pos.y * pos.y));
  return vec3(
    r * cos(el) * cos(az),
    r * cos(el) * sin(az),
    r * sin(el)
  );
}

vec3 fromBall(float r, float az, float el) {
  return vec3(
    r * cos(el) * cos(az),
    r * cos(el) * sin(az),
    r * sin(el)
  );
}

void toBall(vec3 pos, out float az, out float el) {
  az = atan2(pos.y, pos.x);
  el = atan2(pos.z, sqrt(pos.x * pos.x + pos.y * pos.y));
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

mat3 rotateY(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        c, 0.0, -s,
        0.0, 1.0, 0.0,
        s, 0.0, c
    );
}

mat3 rotateX(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat3(
        1.0, 0.0, 0.0,
        0.0, c, s,
        0.0, -s, c
    );
}

// float Gravity(float z) {
//   float G, eZ;
//   const float ER = 6378150.0;
//   const float ER2 = 6378150.0 * 6378150.0;
//   eZ = ER + z;
//   G = 9.81 * ER2 / (eZ * eZ);
//   return G;
// }

float constrain(float val, float min, float max) {
    if (val < min) {
        return min;
    } else if (val > max) {
        return max;
    } else {
        return val;
    }
}

vec3 getDiff (vec3 lastPos, vec3 mouse) {
  vec3 diff = lastPos.xyz - mouse;
  float distance = constrain(length(diff), 1.0, 5.0);
  float strength = 1.0 / (distance * distance);

  diff = normalize(diff);
  diff = diff * strength * -1.0;

  return diff;
}

vec3 resDiff (in vec3 lastPos, in vec3 mouse) {
  vec3 diff = lastPos - mouse;
  diff = normalize(diff) * -1.0;
  return diff;
}

uniform float time;
uniform sampler2D lastTexture;
uniform sampler2D indexerTexture;

uniform vec3 mouse;

void main () {
  // @v@
  // @.@

  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 indexer = texture2D(indexerTexture, uv);
  vec4 lastPos = texture2D(lastTexture, uv);

  float i = indexer.x;
  float e = indexer.y;
  float u = indexer.z;

  vec3 nextPos = vec3(lastPos);

  float x = 0.5 - rand(uv + .1);
  float y = 0.5 - rand(uv + .2);
  float z = 0.5 - rand(uv + .3);

  vec3 ball1 = ballify(vec3(x, y, z), 1.0);

  nextPos = ballify(ball1 + nextPos + cnoise(uv + time), 18.0);

  vec3 m3 = mouse;
  // m3.y -= 100.0;

  nextPos += getDiff(nextPos, m3) * 50.0;

  // remix code end here//
  gl_FragColor = vec4(nextPos, 1.0);
}


    `

    let mouseV3 = new THREE.Vector3(0.0, 0.0, 0.0)

    let init = ({ pingPongShader }) => {
      try {
        let newPingMat = gpuCompute.createShaderMaterial(pingPongShader, {
          lastTexture: { value: null },
          indexerTexture: { value: indexerTexture },
          time: { value: 0 },
          mouse: { value: mouseV3 }
        })
        let newPongMat = gpuCompute.createShaderMaterial(pingPongShader, {
          lastTexture: { value: null },
          indexerTexture: { value: indexerTexture },
          time: { value: 0 },
          mouse: { value: mouseV3 }
        })
        pingMat = newPingMat
        pongMat = newPongMat
      } catch (e) {
        console.error(e)
      }
    }

    init({ pingPongShader: defaultPingPong })

    this.mouseUpdater = ({ x, y, z }) => {
      pingMat.uniforms.mouse.value.copy({ x, y, z })
      pongMat.uniforms.mouse.value.copy({ x, y, z })
    }

    var mouser = () => {
      window.addEventListener('mousemove', (evt) => {
        let x = (evt.pageX - window.innerWidth * 0.5) / window.innerWidth
        let y = (evt.pageY - window.innerHeight * 0.5) / window.innerHeight
        let z = 0.0
        y *= -1

        pingMat.uniforms.mouse.value.copy({ x, y, z })
        pongMat.uniforms.mouse.value.copy({ x, y, z })
      }, false)
      var ev = {
        touchSurface: document.body
      }

      var isClick = false
      ev.touchSurface.addEventListener('click', () => {
        if (!isClick) {
          // pingMat.uniforms.tapCount.value++
          // pongMat.uniforms.tapCount.value++
        }
      }, false)
      ev.touchSurface.addEventListener('touchstart', (evt) => {
        isClick = true
        setTimeout(() => {
          isClick = false
        }, 111)
      }, false)
      ev.touchSurface.addEventListener('touchend', (evt) => {
        if (isClick) {
          // pingMat.uniforms.tapCount.value++
          // pongMat.uniforms.tapCount.value++
        }
      }, false)
      ev.touchSurface.addEventListener('touchmove', (evt) => {
        evt.preventDefault()
        let x = (evt.touches[0].pageX - window.innerWidth * 0.5) / window.innerWidth
        let y = (evt.touches[0].pageY - window.innerHeight * 0.5) / window.innerHeight
        let z = 0.0

        y *= -1

        pingMat.uniforms.mouse.value.copy({ x, y, z })
        pongMat.uniforms.mouse.value.copy({ x, y, z })
      }, false)
    }
    mouser()

    // sim part
    let procSim = () => {
      pingMat.uniforms.lastTexture.value = pongTarget.texture
      pongMat.uniforms.lastTexture.value = pingTarget.texture

      pingMat.uniforms.time.value = window.performance.now() * 0.0001
      pongMat.uniforms.time.value = window.performance.now() * 0.0001

      if (ticker % 2 === 0) {
        gpuCompute.doRenderTarget(pongMat, pongTarget)
      } else {
        gpuCompute.doRenderTarget(pingMat, pingTarget)
      }
    }

    // display part
    var geometry = new THREE.PlaneBufferGeometry(1.0, 1.0, SIZE - 1, SIZE - 1)
    var material = new THREE.ShaderMaterial({
      // blending: THREE.AdditiveBlending,
      // depthTest: false,
      transparent: true,
      depthWrite: false,
      vertexShader: displayV,
      fragmentShader: displayF,
      defines: {
        resolution: 'vec2( ' + SIZE.toFixed(1) + ', ' + SIZE.toFixed(1) + ' )'
      },
      uniforms: {
        time: { value: 0 },
        opacity: { value: 1.0 },
        posTex: { value: null },
        mouse: { value: mouseV3 },
        indexerTexture: { value: indexerTexture },

        picture: { value: new THREE.TextureLoader().load('https://picsum.photos/g/128?image=1081', (texture) => { texture.needsUpdate = true }) },
        pointSize: { value: window.devicePixelRatio || 1.0 }
      }
    })

    var points = this.points = new THREE.Points(geometry, material)
    // var points = ev.points = new THREE.Points(geometry, material)
    points.matrixAutoUpdate = false
    points.updateMatrix()
    points.frustumCulled = false

    // let curOpacity = { opacity: 0 }
    // new TWEEN.Tween(curOpacity)
    //   .to({ opacity: 1 }, 1000)
    //   .easing(TWEEN.Easing.Quadratic.Out)
    //   .onUpdate(() => {
    //     material.uniforms.opacity.value = curOpacity.opacity
    //   })
    //   .start()

    this.$parent.$emit('add', points)

    let rAFID = 0
    let rAF = () => {
      rAFID = window.requestAnimationFrame(rAF)
      procSim()
      if (ticker % 2 === 0) {
        material.uniforms.posTex.value = pongTarget.texture
      } else {
        material.uniforms.posTex.value = pingTarget.texture
      }
      ticker++
      material.uniforms.time.value = window.performance.now() * 0.0001
    }
    rAFID = window.requestAnimationFrame(rAF)

    this.$on('onDestroy', () => {
      window.cancelAnimationFrame(rAFID)
    })
  },
  beforeDestroy () {
    this.$emit('onDestroy')
    if (this.points) {
      this.$parent.$emit('remove', this.points)
    }
  }
}
</script>

<style>

</style>
