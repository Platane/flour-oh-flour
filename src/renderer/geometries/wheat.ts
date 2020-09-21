import { vec3 } from "gl-matrix";
import { zero, x, z } from "../../constant";
import { wheatColorEnd, wheatColorStart } from "../colors";
import { basicDynamic } from "../materials";
import { lookAtMatrix3Inv } from "../shared";

const SIZE = 0.012;

// const x: vec3 = [] as any;

// prettier-ignore
const kernel = [
  [  0.3 , 1.1  ],
  [  0.2 , 0.05 ],
  [  1.12, 0.6  ],
  [  1.3 , 1.25 ],
]

const vertices: vec3[] = kernel.map(() => [] as any);

const nGrain = 6;

const color: vec3 = [] as any;
const p: vec3 = [] as any;

export const createWheat = (origin: vec3, v: vec3, unitGrowth: number) => {
  const m = 0.07;
  const u = Math.max(0, (unitGrowth - (1 - m)) / m);
  const endHop = (1 - Math.abs(u - 0.5) * 2) ** 2;

  vec3.lerp(color, wheatColorStart as any, wheatColorEnd as any, unitGrowth);

  const branchSize = unitGrowth * SIZE * 1.5;
  const branchBase = unitGrowth * SIZE * 0.14;
  const grainScale = unitGrowth * SIZE * 0.3 + endHop * SIZE * 0.22;

  //
  // branch
  //
  for (let k = 2; k--; ) {
    vec3.scale(p, x, -branchBase * (k * 2 - 1));
    vec3.transformMat3(p, p, lookAtMatrix3Inv);
    vec3.add(p, p, origin);
    p[1] -= branchSize * 0.04;

    basicDynamic.pushPoint(p, color, z);
  }

  vec3.scale(p, v, branchSize + (nGrain * grainScale) / 2);
  vec3.add(p, p, origin);
  basicDynamic.pushPoint(p, color, z);

  //
  // grains
  //
  for (let k = nGrain; k--; ) {
    const dx = k >> 1;
    const uy = k % 2 ? 1 : -1;

    for (let i = kernel.length; i--; ) {
      vec3.set(
        vertices[i],
        (kernel[i][0] + (0.1 + 1 - k / nGrain) * 0.05) * uy * grainScale,
        (kernel[i][1] - 0.5) * grainScale,
        0
      );

      vec3.transformMat3(vertices[i], vertices[i], lookAtMatrix3Inv);

      vec3.add(vertices[i], vertices[i], origin);
      vec3.scaleAndAdd(
        vertices[i],
        vertices[i],
        v,
        branchSize + (dx + uy * 0.1) * grainScale
      );
    }

    if (uy === -1) vertices.reverse();

    basicDynamic.pushFace(vertices, color, z);
  }
};
