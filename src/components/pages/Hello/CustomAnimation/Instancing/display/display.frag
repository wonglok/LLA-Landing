
// uniform sampler2D posTex;

uniform sampler2D picture;
uniform float opacity;

varying vec2 vUv;


void main() {
    // vec4 posColor = texture2D(posTex, vUv);

    // vec4 imgColor = texture2D(picture, vUv);

    // vec4 outputColor = imgColor;
    // outputColor.a = outputColor.a * opacity;

    // outputColor.r *= 255.0 / 255.0;
    // outputColor.g *= 129.0 / 255.0;
    // // outputColor.xyz *= posColor.xyz;

    // vec4 outputColor = vec4(vUv.x, vUv.y, vUv.y + vUv.x, opacity);

    // vec4 outputColor = vec4(vUv.x + vUv.y, vUv.y, vUv.y + vUv.x, opacity);

    gl_FragColor = vec4(vec3(1.0), opacity);
}
