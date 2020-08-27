 
// precision highp float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;

uniform mat4 uWorldMatrix;

varying lowp vec3 vColor;

void main(void) {

  gl_Position = uWorldMatrix * vec4(aVertexPosition, 1.0);


  vColor = aVertexColor;
}