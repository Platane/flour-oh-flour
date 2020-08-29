precision highp float;

varying lowp vec3 vColor;
varying lowp vec3 vNormal;

uniform float uTime;


void main(void) {

  

  vec3 staticLightDirection = vec3(1.0,1.0,1.0);
  normalize(staticLightDirection);
  float staticLightPower = clamp( dot(vNormal, staticLightDirection) , 0.0, 1.0 );

  float angle = uTime * 2.0 * 1.0;
  vec3 movingLightDirection = vec3( sin(angle), 1.5, cos(angle) );
  normalize(movingLightDirection);
  float movingLightPower =  dot(vNormal, movingLightDirection) ;

  gl_FragColor = vec4(vColor, 1.0);

  // gl_FragColor.rgb *= clamp(  staticLightPower, 0.02, 0.5 )  +  ( 1.0 + movingLightPower ) * 0.5  ;  

  gl_FragColor = vec4(vNormal * 0.5 + 0.5  , 1.0);

  // gl_FragColor = vec4(lightDirection*0.5+0.5, 1.0);
  // gl_FragColor = vec4(lightPower,lightPower,lightPower, 1.0);
  
}