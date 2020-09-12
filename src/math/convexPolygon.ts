import { epsilon, tmp0 } from "../constant";
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

export const isInsidePolygon = (points: vec3[], n: vec3, p: vec3) => {
  let x = 0;

  for (let i = 0; i < points.length; i++) {
    const A = points[i];
    const B = points[(i + 1) % points.length];

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

const getTriangleArea = (A: vec3, B: vec3, C: vec3) => {
  const ABx = B[0] - A[0];
  const ABy = B[1] - A[1];
  const ABz = B[2] - A[2];

  const ACx = C[0] - A[0];
  const ACy = C[1] - A[1];
  const ACz = C[2] - A[2];

  const nx = ABy * ACz - ABz * ACy;
  const ny = ABz * ACx - ABx * ACz;
  const nz = ABx * ACy - ABy * ACx;

  return Math.hypot(nx, ny, nz) / 2;
};

export const getPolygonArea = (points: vec3[]) => {
  let a = 0;
  for (let i = 0; i < points.length - 1; i++)
    a += getTriangleArea(points[0], points[i], points[i + 1]);

  return a;
};

export const getPolygonCenter = (out: vec3, points: vec3[]) => {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;

  for (let i = points.length; i--; )
    vec3.scaleAndAdd(out, out, points[i], 1 / points.length);

  return out;
};

export const getPolygonBoundingSphereRadius = (points: vec3[]) => {
  const c = getPolygonCenter([] as any, points);
  let dd = 0;
  for (let i = points.length; i--; )
    dd = Math.max(dd, vec3.squaredDistance(points[i], c));
  return Math.sqrt(dd);
};

export const getPolygonBoundingBoxDimension = (points: vec3[]) => [
  Math.max(...points.map((v) => v[0])) - Math.min(...points.map((v) => v[0])),
  Math.max(...points.map((v) => v[1])) - Math.min(...points.map((v) => v[1])),
  Math.max(...points.map((v) => v[2])) - Math.min(...points.map((v) => v[2])),
];
