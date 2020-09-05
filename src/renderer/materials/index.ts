import { createProgram } from "../utils/program";
import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";
import { gl } from "../../canvas";
import { getAttributeLocation, getUniformLocation } from "../utils/location";
import { worlInverseTransposedMatrix, worldMatrix } from "../camera";

const program = createProgram(gl, codeVert, codeFrag);

const colorLocation = getAttributeLocation(gl, program, "aVertexColor");
const normalLocation = getAttributeLocation(gl, program, "aVertexNormal");
const positionLocation = getAttributeLocation(gl, program, "aVertexPosition");

const timeLocation = getUniformLocation(gl, program, "uTime");
const worldMatrixLocation = getUniformLocation(gl, program, "uWorldMatrix");
const worldInverseTransposedMatrixLocation = getUniformLocation(
  gl,
  program,
  "uWorldInverseTransposedMatrix"
);

const s = Date.now();

const gIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);
gl.bufferData(
  gl.ELEMENT_ARRAY_BUFFER,
  new Uint16Array(3 * 20 * 1000).map((_, i) => i),
  gl.STATIC_DRAW
);

export const createMaterial = () => {
  const positionBuffer = gl.createBuffer();
  const normalBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();
  let n = 0;

  const updateGeometry = (
    colors: Float32Array,
    positions: Float32Array,
    normals: Float32Array
  ) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    n = positions.length / 3;

    if (process.env.NODE_ENV !== "production") {
      console.log("nfaces:", n / 3);
      if (n / 3 > 20 * 1000) throw new Error("index buffer too short");
    }
  };

  const draw = () => {
    gl.useProgram(program);

    gl.uniformMatrix4fv(worldMatrixLocation, false, worldMatrix);
    gl.uniformMatrix4fv(
      worldInverseTransposedMatrixLocation,
      false,
      worlInverseTransposedMatrix
    );
    gl.uniform1f(timeLocation, (Date.now() - s) / 1000);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
  };

  return { updateGeometry, draw };
};
