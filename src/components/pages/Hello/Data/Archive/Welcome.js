import { makeOneWord } from '../HelloData'

export default ({ camera, fullScreener }) => {
  let vs = `
// varying vec3 vPos;
uniform float time;
varying vec2 vUv;

void main (void) {
  vec3 nPos = position;

  nPos.z += sin(time * 4.0 + nPos.x) * 0.15;
  nPos.z += sin(time * 4.0 + nPos.y) * 0.15;

  vUv = uv;

  vec4 mvPosition = modelViewMatrix * vec4(nPos, 1.0);
  vec4 outputPos = projectionMatrix * mvPosition;
  gl_Position = outputPos;
  gl_PointSize = 1.0;
}
`

  let fs = `
// varying vec3 vPos;
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

  vec3 final = vec3((1.0 - textColor) * pattern);
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

  var word = makeOneWord()
  word.data.text = `Welcome to
V.E.L.A.`
  word.pos = {
    x: 0,
    y: 0,
    z: 0
  }
  word.effect.vs = vs
  word.effect.fs = fs
  word.data.fontSize = '100'
  word.data.width = 1000

  return word
}
