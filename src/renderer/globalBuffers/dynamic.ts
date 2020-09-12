import { vec3 } from "gl-matrix";

export const vertices = new Float32Array(3 * 50 * 1000);
export const normals = new Float32Array(3 * 50 * 1000);
export const colors = new Float32Array(3 * 50 * 1000);

// number of face
export let n = 0;

export const incrementN = () => n++;
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

    n++;
  }
};
