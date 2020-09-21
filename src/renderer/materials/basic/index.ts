import { vec3 } from "gl-matrix";
import { gIndexBuffer, maxIndex } from "../utils";
import { cross } from "../../../math/convexPolygon";
import { createProgram } from "../../utils/program";
import { getAttributeLocation, getUniformLocation } from "../../utils/location";
import { gl } from "../../../canvas";
import { worldMatrix } from "../../shared";

import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";

const program = createProgram(gl, codeVert, codeFrag);

const colorLocation = getAttributeLocation(gl, program, "aVertexColor");
const normalLocation = getAttributeLocation(gl, program, "aVertexNormal");
const positionLocation = getAttributeLocation(gl, program, "aVertexPosition");

const timeLocation = getUniformLocation(gl, program, "uTime");
const worldMatrixLocation = getUniformLocation(gl, program, "uWorldMatrix");

export const createBasicMaterial = (
  usage: Parameters<typeof gl.bufferData>[2]
) => {
  const positionBuffer = gl.createBuffer();
  const normalBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();
  let vertexCountBuffer = 0;

  const positions = new Float32Array(3 * 3 * maxIndex);
  const normals = new Float32Array(3 * 3 * maxIndex);
  const colors = new Float32Array(3 * 3 * maxIndex);
  let vertexCount = 0;

  const reset = () => {
    vertexCountBuffer = 0;
    vertexCount = 0;
  };

  const pushPoint = (
    point: number[] | vec3,
    color: number[] | vec3,
    normal: number[] | vec3
  ) => {
    positions[vertexCount * 3 + 0] = point[0];
    positions[vertexCount * 3 + 1] = point[1];
    positions[vertexCount * 3 + 2] = point[2];

    colors[vertexCount * 3 + 0] = color[0];
    colors[vertexCount * 3 + 1] = color[1];
    colors[vertexCount * 3 + 2] = color[2];

    normals[vertexCount * 3 + 0] = normal[0];
    normals[vertexCount * 3 + 1] = normal[1];
    normals[vertexCount * 3 + 2] = normal[2];

    vertexCount++;
  };

  const pushFace = (
    points: number[][] | vec3[],
    color: number[] | vec3,
    normal: number[] | vec3
  ) => {
    for (let i = 1; i < points.length - 1; i++) {
      pushPoint(points[0], color, normal);
      pushPoint(points[i], color, normal);
      pushPoint(points[i + 1], color, normal);
    }
  };

  const normal: vec3 = new Float32Array(3) as any;
  const pushFlatFace = (
    points: number[][] | vec3[],
    color: number[] | vec3
  ) => {
    cross(
      normal,
      points[0] as any,
      points[1] as any,
      points[0] as any,
      points[2] as any
    );
    vec3.normalize(normal, normal);

    pushFace(points, color, normal);
  };

  const draw = () => {
    gl.useProgram(program);

    gl.uniformMatrix4fv(worldMatrixLocation, false, worldMatrix);
    gl.uniform1f(timeLocation, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);

    if (vertexCount !== vertexCountBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, colors, usage);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, usage);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, normals, usage);
      gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

      vertexCountBuffer = vertexCount;
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    }

    gl.drawElements(gl.TRIANGLES, vertexCountBuffer, gl.UNSIGNED_SHORT, 0);
  };

  return { draw, reset, pushPoint, pushFlatFace, pushFace };
};

export type BasicMaterial = ReturnType<typeof createBasicMaterial>;
