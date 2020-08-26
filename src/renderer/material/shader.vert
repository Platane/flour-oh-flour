 
// precision highp float;

attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uWorldMatrix;

varying lowp vec4 vColor;

void main(void) {

  vec4 position = uWorldMatrix * vec4(aVertexPosition, 1.0);

  gl_Position = position;

  vColor = aVertexColor;
}