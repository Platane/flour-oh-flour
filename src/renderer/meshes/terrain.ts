import { createMaterial, gIndexes } from "../materials";
import { getFlatShadingNormals } from "../utils/flatShading";
import { generatePerlinNoise } from "../../math/generatePerlinNoise";
import { vec2, mat3, vec3 } from "gl-matrix";
import { getDelaunayTriangulation } from "../../math/getDelaunayTriangulation";
import { faceToVertices } from "../utils/faceToVertices";
import { createWindmill } from "../geometries.ts/windmill";
import { cells } from "../../logic";
import { zero, tmp0 } from "../../constant";

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

const points = Array.from({ length: 300 }, () => {
  let x = 1;
  let y = 1;
  while (x * x + y * y > 1) {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
  }

  return [x, y];
});

const indexes = getDelaunayTriangulation(points as vec2[]);

const points3d = points.map(([x, z]) => [x, h(x, z), z]);

export const staticVertices: number[] = [];
let staticColors: number[] = [];

for (const [a, b, c] of indexes) {
  const A = points3d[a];
  const B = points3d[b];
  const C = points3d[c];

  if ((A[0] - C[0]) * (A[2] - B[2]) - (A[2] - C[2]) * (A[0] - B[0]) > 0)
    staticVertices.push(...A, ...B, ...C);
  else staticVertices.push(...A, ...C, ...B);

  staticColors.push(0.2, 0.7, 0.25);
  staticColors.push(0.2, 0.7, 0.25);
  staticColors.push(0.2, 0.7, 0.25);
}

const cellFaces = [
  Array.from({ length: 5 }).map((_, i, arr) => {
    const a = i / arr.length;

    const r = 0.4;

    return [
      //
      Math.sin(a * Math.PI * 2) * r,
      1,
      Math.cos(a * Math.PI * 2) * r,
    ];
  }),
];

// currently only the cells are activatable,
// the active face points to the index of the face
export const activeFaces: number[] = [];

// export const cellFacesIndexes: number[][] = [];
cellFaces.forEach((face, j) => {
  const vs = faceToVertices(face);

  for (let i = vs.length / 9; i--; )
    activeFaces[staticVertices.length / 9 + i] = j;

  // cellFacesIndexes.push(
  //   Array.from(
  //     { length: vs.length / 9 },
  //     (_, i) => staticVertices.length / 9 + i
  //   )
  // );

  staticVertices.push(...vs);
  for (let i = vs.length / 3; i--; )
    staticColors.push(90 / 255, 92 / 255, 31 / 255);

  cells.push({ growth: 0, area: 1 } as any);
});

const p = tmp0;
for (let u = 5; u--; ) {
  let x = 1;
  let y = 1;
  while (x * x + y * y > 0.9) {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
  }

  const { vertices, colors } = createWindmill();

  const s = 0.035;
  const o = [x, h(x, y), y];
  const a = Math.random() * Math.PI * 2;

  for (let i = 0; i < vertices.length; i += 3) {
    p[0] = vertices[i + 0];
    p[1] = vertices[i + 1];
    p[2] = vertices[i + 2];

    vec3.rotateY(p, p, zero, a);

    vertices[i + 0] = p[0] * s + o[0];
    vertices[i + 1] = p[1] * s + o[1];
    vertices[i + 2] = p[2] * s + o[2];
  }

  staticVertices.push(...vertices);
  staticColors.push(...colors);
}

// materials
const staticMaterial = createMaterial();
const dynamicMaterial = createMaterial();

staticMaterial.updateGeometry(
  new Float32Array(staticColors),
  new Float32Array(staticVertices),
  getFlatShadingNormals(
    gIndexes.subarray(0, staticVertices.length / 3),
    staticVertices as any
  )
);

//@ts-ignore
staticColors = null;

export const draw = () => {
  staticMaterial.draw();
  dynamicMaterial.draw();
};
