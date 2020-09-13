import { vec3, mat4 } from "gl-matrix";
import { pushFlatFace as defaultPushFlatFace } from "../globalBuffers/dynamic";
import { up, x, z } from "../../constant";

const base = [up, x, z];
const kernel = [
  [-1, 1],
  [-1, -1],
  [1, -1],
  [1, 1],
] as const;

export const bagSize = 0.01;

export const createFlourBag = (
  transform: mat4,
  pushFlatFace: typeof defaultPushFlatFace
) => {
  for (let k = 3; k--; ) {
    const u = base[(k + 0) % 3];
    const v = base[(k + 1) % 3];
    const n = base[(k + 2) % 3];

    for (const tn of [1, -1]) {
      const vertices = kernel.map(([tu, tv]) => {
        const p: vec3 = [0, 0, 0] as any;

        vec3.scaleAndAdd(p, p, n, tn * bagSize);
        vec3.scaleAndAdd(p, p, u, tu * bagSize);
        vec3.scaleAndAdd(p, p, v, tv * bagSize);
        vec3.transformMat4(p, p, transform);

        return p;
      });

      if (tn === 1) vertices.reverse();

      pushFlatFace(vertices, n);
    }
  }
};
