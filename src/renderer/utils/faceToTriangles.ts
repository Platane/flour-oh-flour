import { vec3 } from "gl-matrix";

export const faceToVertices = (points: number[][]) => {
  const vertices: number[] = [];
  for (let i = 1; i < points.length - 1; i++) {
    vertices.push(...points[0], ...points[i + 0], ...points[i + 1]);
  }

  return vertices;
};
