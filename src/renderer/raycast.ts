import { vec3, mat4 } from "gl-matrix";
import { worldMatrix, eye } from "./camera";
import { epsilon } from "../constant";

const worldMatrixInv: mat4 = [] as any;

const A: vec3 = [] as any;
const B: vec3 = [] as any;
const C: vec3 = [] as any;
const N: vec3 = [] as any;

const AB: vec3 = [] as any;
const BC: vec3 = [] as any;
const CA: vec3 = [] as any;

const v: vec3 = [] as any;

export const raycastFromScreen = (
  x: number,
  y: number,
  vertices: number[],
  n: number
) => {
  // get the ray
  mat4.invert(worldMatrixInv, worldMatrix);
  vec3.transformMat4(v, [x, y, 0.5], worldMatrixInv);

  vec3.sub(v, v, eye);
  vec3.normalize(v, v);

  return raycast(eye, v, vertices, n);
};

const tmp: vec3 = [] as any;
const p: vec3 = [] as any;

export const raycast = (
  origin: vec3,
  direction: vec3,
  vertices: number[],
  n: number
) => {
  let bestT = Infinity;
  let bestP: vec3 = [0, 0, 0];
  let bestI = -1;
  for (let i = 0; i < n * 9; i += 9) {
    A[0] = vertices[i + 0 + 0];
    A[1] = vertices[i + 0 + 1];
    A[2] = vertices[i + 0 + 2];

    B[0] = vertices[i + 3 + 0];
    B[1] = vertices[i + 3 + 1];
    B[2] = vertices[i + 3 + 2];

    C[0] = vertices[i + 6 + 0];
    C[1] = vertices[i + 6 + 1];
    C[2] = vertices[i + 6 + 2];

    vec3.sub(AB, B, A);
    vec3.sub(BC, C, B);
    vec3.sub(CA, A, C);

    vec3.cross(N, AB, BC);
    vec3.normalize(N, N);

    const o = vec3.dot(N, direction);

    if (Math.abs(o) > epsilon) {
      vec3.sub(tmp, A, origin);

      const t = vec3.dot(N, tmp) / o;

      if (t < bestT) {
        p[0] = origin[0] + t * direction[0];
        p[1] = origin[1] + t * direction[1];
        p[2] = origin[2] + t * direction[2];

        const a = vec3.dot(N, vec3.cross(tmp, AB, vec3.sub(tmp, A, p))) > 0;
        const b = vec3.dot(N, vec3.cross(tmp, BC, vec3.sub(tmp, B, p))) > 0;
        const c = vec3.dot(N, vec3.cross(tmp, CA, vec3.sub(tmp, C, p))) > 0;

        if (a === b && a === c) {
          bestT = t;
          bestP[0] = p[0];
          bestP[1] = p[1];
          bestP[2] = p[2];
          bestI = i / 9;
        }
      }
    }
  }

  if (bestI >= 0) return { p: bestP, t: bestT, i: bestI };
};
