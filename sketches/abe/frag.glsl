precision highp float;

uniform vec4 uMaterialColor;
uniform sampler2D uSampler;
uniform bool isTexture;
uniform bool uUseLighting;

varying vec3 vLightWeighting;
varying highp vec2 vVertTexCoord;

uniform float t; 

void main(void) {
  gl_FragColor = isTexture ? texture2D(uSampler, vVertTexCoord) : uMaterialColor;
  if (uUseLighting) {
    gl_FragColor.rgb *= vLightWeighting;
  } 
  float k = 0.1 * sin(t * 5.0 + vVertTexCoord.y * 5.0);
  gl_FragColor.rgb *= 0.8;
  gl_FragColor.rgb += vec3(k);
}
