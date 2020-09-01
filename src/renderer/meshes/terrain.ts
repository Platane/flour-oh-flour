import { createMaterial } from "../materials";
import { getFlatShadingNormals } from "../utils/flatShading";
import { generatePerlinNoise } from "../../math/generatePerlinNoise";
import { vec2 } from "gl-matrix";
import { getDelaunayTriangulation } from "../../math/getDelaunayTriangulation";

const p0 = generatePerlinNoise(3, 3, 0.4);
const p1 = generatePerlinNoise(3, 3, 0.7);

const h = (x: number, y: number) => {
  let h = -0.3;
  h += p0(x + 1.2, y + 1.16) * 0.2;
  h += p1(x + 1.7, y + 1.6) * 0.8;

  const r = Math.sqrt(x * x + y * y);
  const k = 1 - r ** 2;

  h *= -k;

  return h;
};

const points = Array.from({ length: 2000 }, () => {
  let x = 1;
  let y = 1;
  while (x * x + y * y > 1) {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
  }

  return [x, y];
});

const indices = getDelaunayTriangulation(points as vec2[]);

const vertices = points.map(([x, z]) => [x, h(x, z), z]);

const fVertices = Float32Array.from(
  indices
    .map(([a, b, c]) => {
      const A = vertices[a];
      const B = vertices[b];
      const C = vertices[c];

      if ((A[0] - C[0]) * (A[2] - B[2]) - (A[2] - C[2]) * (A[0] - B[0]) > 0)
        return [A, B, C];
      else return [A, C, B];
    })
    .flat(2)
);
const fColors = Float32Array.from(
  indices
    .map(([]) => {
      // const color = [Math.random(), Math.random(), Math.random()];
      const color = [0.3, 0.8, 0.4];
      return [color, color, color];
    })
    .flat(2)
);
const fIndices = Uint16Array.from(
  indices.map((_, i) => [i * 3 + 0, i * 3 + 1, i * 3 + 2]).flat() as number[]
);
const fNormals = getFlatShadingNormals(fIndices, fVertices);

const m = createMaterial();

m.updateGeometry(fIndices, fColors, fVertices, fNormals);

export const draw = m.draw;
