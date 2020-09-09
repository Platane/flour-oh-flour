import { epsilon } from "../constant";
import { vec3 } from "gl-matrix";

/**
 * cross product of A1A2 ^B1B2
 */
export const cross = (out: vec3, A1: vec3, A2: vec3, B1: vec3, B2: vec3) => {
  const ux = A2[0] - A1[0];
  const uy = A2[1] - A1[1];
  const uz = A2[2] - A1[2];

  const vx = B2[0] - B1[0];
  const vy = B2[1] - B1[1];
  const vz = B2[2] - B1[2];

  out[0] = uy * vz - uz * vy;
  out[1] = uz * vx - ux * vz;
  out[2] = ux * vy - uy * vx;

  return out;
};

export const getNormalVector = (out: vec3, [A, B, C]: vec3[]) =>
  cross(out, A, B, A, C);

export const isInsideHull = (hull: vec3[], n: vec3, p: vec3) => {
  let x = 0;

  for (let i = 0; i < hull.length; i++) {
    const A = hull[i];
    const B = hull[(i + 1) % hull.length];

    const ux = B[0] - A[0];
    const uy = B[1] - A[1];
    const uz = B[2] - A[2];

    const vx = p[0] - A[0];
    const vy = p[1] - A[1];
    const vz = p[2] - A[2];

    const dot =
      n[0] * (uy * vz - uz * vy) +
      n[1] * (uz * vx - ux * vz) +
      n[2] * (ux * vy - uy * vx);

    if (Math.abs(dot) > epsilon) {
      if (x * dot < 0) return false;

      x = dot > 0 ? 1 : -1;
    }
  }

  return true;
};
