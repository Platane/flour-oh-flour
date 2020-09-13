import { vec3 } from "gl-matrix";
import { cross } from "../../math/convexPolygon";

const maxN = 28 * 1000;

export const vertices = new Float32Array(3 * 3 * maxN);
export const normals = new Float32Array(3 * 3 * maxN);
export const colors = new Float32Array(3 * 3 * maxN);

// number of face
export let n = 0;

export const incrementN = () => {
  n++;

  if (process.env.NODE_ENV !== "production" && n >= maxN)
    throw new Error("buffer too small");
};

export const resetN = () => (n = 0);

export const pushFace = (
  points: number[][] | vec3[],
  color: number[] | vec3,
  normal: number[] | vec3
) => {
  for (let i = 1; i < points.length - 1; i++) {
    vertices[n * 9 + 0 + 0] = points[0][0];
    vertices[n * 9 + 0 + 1] = points[0][1];
    vertices[n * 9 + 0 + 2] = points[0][2];

    vertices[n * 9 + 3 + 0] = points[i + 0][0];
    vertices[n * 9 + 3 + 1] = points[i + 0][1];
    vertices[n * 9 + 3 + 2] = points[i + 0][2];

    vertices[n * 9 + 6 + 0] = points[i + 1][0];
    vertices[n * 9 + 6 + 1] = points[i + 1][1];
    vertices[n * 9 + 6 + 2] = points[i + 1][2];

    for (let u = 9; u--; ) {
      normals[n * 9 + u] = normal[u % 3];
      colors[n * 9 + u] = color[u % 3];
    }

    incrementN();
  }
};

const nn: vec3 = [] as any;
export const pushFlatFace = (
  points: number[][] | vec3[],
  color: number[] | vec3
) => {
  cross(
    nn,
    points[0] as any,
    points[1] as any,
    points[0] as any,
    points[2] as any
  );
  vec3.normalize(nn, nn);

  pushFace(points, color, nn);
};
