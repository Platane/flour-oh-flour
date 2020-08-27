import { createProgram } from "../util/program";
import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";
import { gl } from "../../canvas";
import { getAttributeLocation, getUniformLocation } from "../util/location";

const program = createProgram(gl, codeVert, codeFrag);

const colorLocation = getAttributeLocation(gl, program, "aVertexColor");
const positionLocation = getAttributeLocation(gl, program, "aVertexPosition");
const worldMatrixLocation = getUniformLocation(gl, program, "uWorldMatrix");

export const createMaterial = () => {
  const colorBuffer = gl.createBuffer();
  const positionBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  let n = 0;

  const updateGeometry = (
    indexes: Uint16Array,
    colors: Float32Array,
    positions: Float32Array
  ) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW);

    n = indexes.length / 3;
  };

  const draw = (worldMatrix: Float32Array) => {
    gl.useProgram(program);

    gl.uniformMatrix4fv(worldMatrixLocation, false, worldMatrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
  };

  return { updateGeometry, draw };
};
