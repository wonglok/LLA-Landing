// varying vec3 vPos;
uniform float time;
varying vec2 vUv;

void main (void) {
  vec3 nPos = position;

  // nPos.z += sin(time * 4.0 + nPos.x) * 0.5;
  // nPos.z += sin(time * 4.0 + nPos.y) * 0.5;

  vUv = uv;

  vec4 mvPosition = modelViewMatrix * vec4(nPos, 1.0);
  vec4 outputPos = projectionMatrix * mvPosition;
  gl_Position = outputPos;
  gl_PointSize = 1.0;
}