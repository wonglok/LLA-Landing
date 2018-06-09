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

  vec3 final = vec3((1.0 - textColor) * (pattern.xxxw));
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
