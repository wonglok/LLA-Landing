
// uniform sampler2D posTex;

uniform sampler2D picture;
uniform float opacity;

varying vec2 vUv;

uniform vec3 mouse;


void main() {
    // vec4 posColor = texture2D(posTex, vUv);

    vec4 imgColor = texture2D(picture, vUv);
    vec4 outputColor = imgColor;
    outputColor.a = outputColor.a * opacity;

    vec4 outputColor2 = vec4(vUv.x, vUv.y, vUv.y + vUv.x, opacity);

    gl_FragColor = mix(outputColor2, outputColor, smoothstep(0.0, 1.0, abs(mouse.y) / 0.5));
}
