precision highp float;

varying lowp vec3 vColor;
varying lowp vec3 vNormal;

uniform float uTime;


void main(void) {

  float angle = uTime * 2.0 * 1.0;
  vec3 lightDirection = vec3( sin(angle), -10, cos(angle) );
  
  normalize(lightDirection);

  float light = clamp( dot(vNormal, lightDirection) , 0.0, 1.0 );

  gl_FragColor = vec4(vColor, 1.0);

  gl_FragColor.rgb *= light + ( 0.0 * uTime );  

  gl_FragColor = vec4(vNormal, 1.0);
}