import { vec3 } from "gl-matrix";
import { createWheat } from "./wheat";
import { tmp0, tmp1, tmp2, tmp3, tmp4 } from "../../constant";
import { cells } from "../../logic";

const n: vec3 = [] as any;
const u: vec3 = [] as any;
const v: vec3 = [] as any;

const wheatSpace = 0.07;
const lineSpace = 0.06;

export const createField = (cell: vec3[], direction: vec3, i: number) => {
  // compute the center
  tmp0[0] = 0;
  tmp0[1] = 0;
  tmp0[2] = 0;

  for (const p of cell) {
    tmp0[0] += p[0] / cell.length;
    tmp0[1] += p[1] / cell.length;
    tmp0[2] += p[2] / cell.length;
  }

  // compute bounding sphere
  let r = Infinity;
  for (const p of cell) {
    const l = vec3.distance(p, tmp0);
    if (l < r) r = l;
  }

  // compute axes
  vec3.sub(tmp1, cell[1], cell[0]);
  vec3.sub(tmp2, cell[2], cell[0]);
  vec3.cross(n, tmp1, tmp2);

  vec3.normalize(n, n);

  vec3.cross(u, n, direction);
  vec3.normalize(u, u);

  vec3.cross(v, u, n);

  // origins

  const wheatOrigins: vec3[] = [];

  const um = Math.ceil(r / lineSpace) * lineSpace;
  const im = Math.ceil(r / wheatSpace) * wheatSpace;

  for (let ul = -um; ul <= um; ul += lineSpace)
    for (let il = -im; il <= im; il += wheatSpace) {
      vec3.copy(tmp1, tmp0);
      vec3.scaleAndAdd(tmp1, tmp1, u, ul);
      vec3.scaleAndAdd(tmp1, tmp1, v, il);

      const isInside = cell
        .map((_, i, cell) => {
          const A = cell[i];
          const B = cell[(i + 1) % cell.length];

          return (
            vec3.dot(
              n,
              vec3.cross(tmp2, vec3.sub(tmp2, tmp1, A), vec3.sub(tmp3, B, A))
            ) > 0
          );
        })
        .every((x, _, [u]) => x === u);

      if (isInside) wheatOrigins.push(tmp1.slice() as any);
    }

  const update = () => {
    const vertices: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];

    for (const o of wheatOrigins) {
      const m = createWheat(o, [0, 1, 0], cells[i].growth);

      vertices.push(...m.vertices);
      normals.push(...m.normals);
      colors.push(...m.colors);
    }

    return { vertices, colors, normals };
  };

  return update;
};
