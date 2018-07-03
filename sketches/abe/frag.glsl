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
  float k = 1.0 + 0.5 * sin(t * 5.0);
  gl_FragColor.rgb *= k;
}
