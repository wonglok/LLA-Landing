precision highp sampler2D;

uniform sampler2D posTex;
uniform sampler2D parTex;
// uniform sampler2D rotTex;
uniform float pointSize;
// uniform sampler2D indexerTexture;


varying vec2 vUv;

uniform float time;

attribute vec2 reader;

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

void main() {

    vec2 nUV = reader / resolution;

    // vec4 info = texture2D(indexerTexture, nUV);
    vec3 GPUPos = texture2D(posTex, nUV).xyz;
    vec3 GPUPar = texture2D(parTex, uv).xyz;

    GPUPar = ballify(GPUPar, 5.0);

    // vec4 GPURot = texture2D(rotTex, nUV);

    // GPUPos.xyz = ballify(GPUPos.xyz, 17.0);

    // GPUPos = rotateY(GPURot.y) * GPUPos;

    vec4 mvPosition = modelViewMatrix * vec4(GPUPos + GPUPar, 1.0);
    vec4 outputPos = projectionMatrix * mvPosition;

    // outputPos.y = outputPos.y + sin(outputPos.y + time * 50.0) * sin(outputPos.y + time * 50.0);
    // outputPos.x = outputPos.x + cos(outputPos.x + time * 50.0) * sin(outputPos.x + time * 50.0);

    vUv = uv;

    gl_Position = outputPos;
    gl_PointSize = pointSize;
}
