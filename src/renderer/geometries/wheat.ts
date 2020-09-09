import { vec3 } from "gl-matrix";
import { lookAtMatrix3Inv } from "../camera";
import { z, tmp0, tmp1 } from "../../constant";
import { maxGrowth } from "../../logic";
import { wheatColorEnd, wheatColorStart } from "../colors";
import { pushFace } from "../meshes/sharedBuffer";
import { clamp } from "../../math/utils";

const SIZE = 0.03;

// const n: vec3 = [] as any;
const n = tmp0;

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

const nGrain = 6;

export const getRequiredFaceNumber = () => 1 + nGrain * (kernel.length - 2);

export const createWheat = (origin: vec3, v: vec3, growth: number) => {
  vec3.cross(n, v, z);
  vec3.normalize(n, n);

  const s = growth / maxGrowth;

  // color randomization
  // tmp1[0] = clamp(
  //   wheatColorEnd[0] + Math.sin(12312 * origin[0] ** 2) * 0.1,
  //   0,
  //   1
  // );
  // tmp1[1] = clamp(
  //   wheatColorEnd[1] + Math.sin(122 * origin[1] ** 2) * 0.1,
  //   0,
  //   1
  // );
  // tmp1[2] = clamp(
  //   wheatColorEnd[2] + Math.sin(1227 * origin[0] ** 2 + 645 * origin[1]) * 0.05,
  //   0,
  //   1
  // );

  const color = vec3.lerp(
    tmp1,
    wheatColorStart as any,
    wheatColorEnd as any,
    s
  );

  const branchSize = s * SIZE * 1.2;
  const branchBase = s * SIZE * 0.1;
  const grainScale = s * SIZE * 0.3;

  // branch

  const branchFace = [
    vec3.scale([] as any, n, -branchBase),
    vec3.scale([] as any, n, branchBase),
  ].map((out: any) => {
    vec3.transformMat3(out, out, lookAtMatrix3Inv);

    vec3.add(out, out, origin);
    out[1] -= branchSize * 0.04;

    return out as vec3;
  });

  const out: vec3 = [] as any;
  vec3.scale(out, v, branchSize + (nGrain * grainScale) / 2);
  vec3.add(out, out, origin);
  branchFace.push(out);

  pushFace(branchFace, color, z);

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

      vec3.transformMat3(out, out, lookAtMatrix3Inv);

      vec3.add(out, out, origin);
      vec3.scaleAndAdd(out, out, v, branchSize + (dx + uy * 0.1) * grainScale);

      return out;
    });

    if (uy === 1) vertices.reverse();

    pushFace(vertices, color, z);
  }
};
