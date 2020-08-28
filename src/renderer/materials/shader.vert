 
// precision highp float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexColor;

uniform mat4 uWorldMatrix;
uniform mat4 uWorldInverseTransposedMatrix;

varying lowp vec3 vColor;
varying lowp vec3 vNormal;

void main(void) {

  gl_Position = uWorldMatrix * vec4(aVertexPosition, 1.0);

  vNormal = mat3(uWorldInverseTransposedMatrix) * aVertexNormal;
  vNormal = mat3(uWorldMatrix) * aVertexNormal;
  vNormal = aVertexNormal;
  
  vColor = aVertexColor ;
}