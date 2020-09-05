import { vec3, mat3, mat4, vec2 } from "gl-matrix";
import { getFlatShadingNormals } from "../utils/flatShading";
import { createMaterial } from "../materials";
import { toBuffer } from "./windmill";
import { worldMatrix, lookAtMatrix } from "../camera";

const SIZE = 1;

const m: mat3 = [] as any;

const z: vec3 = [0, 0, 1];
const n: vec3 = [0, 0, 0];

// prettier-ignore
const kernel = [
  // [0.2 , 0.0],
  // [1.0 , 0.8],
  // [0.13, 1.0],
  // [0   , 0.4],

  // [0.4   , 0.9],
  // [0.1   , 0.1],
  // [0.5   , 0.0],
  // [0.9   , 0.1],
  // [0.6   , 0.9],

  [  0.3 , 1.1  ],
  [  0.2 , 0.05 ],
  [  1.12, 0.6  ],
  [  1.3 , 1.25 ],
]

export const createWheat = (origin: vec3, v: vec3, growth: number) => {
  const faces: { vertices: vec3[]; color: number[] }[] = [];

  mat3.fromMat4(m, lookAtMatrix);
  mat3.invert(m, m);

  vec3.cross(n, v, z);
  vec3.normalize(n, n);

  const color = [1, 1, 0.3];

  const branchSize = 1.2;
  const branchBase = 0.04;
  const grainScale = 0.3;

  const nGrain = 8;

  // branch

  const vertices = [
    vec3.scale([] as any, n, -branchBase),
    vec3.scale([] as any, n, branchBase),
  ].map((out: any) => {
    vec3.transformMat3(out, out, m);

    vec3.add(out, out, origin);

    return out;
  });

  vertices.push(
    vec3.scale([] as any, v, branchSize + (nGrain * grainScale) / 2)
  );

  faces.push({ vertices, color });

  // grains
  for (let k = nGrain; k--; ) {
    const dx = k >> 1;
    const uy = k % 2 ? 1 : -1;

    const vertices = kernel.map(([x, y]) => {
      const out: vec3 = [
        (y + (0.1 + 1 - k / nGrain) * 0.05) * uy * grainScale,
        (x - 0.5) * grainScale,
        0,
      ];

      vec3.transformMat3(out, out, m);

      vec3.add(out, out, origin);
      vec3.scaleAndAdd(out, out, v, branchSize + (dx + uy * 0.1) * grainScale);

      return out;
    });

    if (uy === 1) vertices.reverse();

    faces.push({ vertices, color });
  }

  return toBuffer(faces);
};

const material = createMaterial();

export const draw = () => {
  const a = Date.now() * 0.001;
  const v: vec3 = [0, Math.sin(a), Math.cos(a)];

  v[0] = 0.5;
  v[1] = 1;
  v[2] = 0;

  vec3.normalize(v, v);

  const wm = createWheat([0.0, 0, 0.0], v, 0);

  const normals = new Float32Array(wm.vertices.length);
  for (let i = wm.vertices.length / 3; i--; ) {
    normals[i * 3 + 0] = 0;
    normals[i * 3 + 1] = 0;
    normals[i * 3 + 2] = 1;
  }

  material.updateGeometry(wm.colors, wm.vertices, normals);
  material.draw();
};
