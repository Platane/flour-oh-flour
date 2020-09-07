import { vec3 } from "gl-matrix";
import { createWheat } from "./wheat";
import { tmp0, tmp1, tmp2, tmp3, tmp4 } from "../../constant";
import { cells, maxTic, date } from "../../logic";
import { clamp } from "../../math/utils";
import { faceToVertices } from "../utils/faceToVertices";
import { hintColor } from "../colors";
import { getWindDirection } from "./wind";

const wheatSpace = 0.07;
const lineSpace = 0.06;

export const createField = (cell: vec3[], direction: vec3, i: number) => {
  // compute the center
  const c: vec3 = [0, 0, 0];

  for (const p of cell) {
    c[0] += p[0] / cell.length;
    c[1] += p[1] / cell.length;
    c[2] += p[2] / cell.length;
  }

  // compute bounding sphere
  let r = Infinity;
  for (const p of cell) {
    const l = vec3.distance(p, c);
    if (l < r) r = l;
  }

  // compute axes
  const u = vec3.sub([] as any, cell[1], cell[0]);
  const v = vec3.sub([] as any, cell[2], cell[0]);
  const n = vec3.cross([] as any, u, v);

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
      vec3.copy(tmp1, c);
      vec3.scaleAndAdd(
        tmp1,
        tmp1,
        u,
        ul + (Math.random() - 0.5) * lineSpace * 0.3
      );
      vec3.scaleAndAdd(
        tmp1,
        tmp1,
        v,
        il + (Math.random() - 0.5) * lineSpace * 0.3
      );

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

  const lcell = cells[i];

  const particules = [];

  const update = () => {
    const vertices: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];

    for (const o of wheatOrigins) {
      const m = createWheat(o, getWindDirection(tmp2, o), cells[i].growth);

      vertices.push(...m.vertices);
      normals.push(...m.normals);
      colors.push(...m.colors);
    }

    if (lcell.type === "grown") {
      if (lcell.tic > 0) {
        const k = clamp(lcell.tic / maxTic, 0, 1);

        const h = 0.005;

        vec3.copy(tmp0, c);
        vec3.scaleAndAdd(tmp0, tmp0, n, h);

        for (let i = cell.length; i--; ) {
          const A = cell[i];
          const B = cell[(i + 1) % cell.length];

          vec3.copy(tmp1, A);
          vec3.copy(tmp2, B);
          vec3.scaleAndAdd(tmp1, tmp1, n, h);
          vec3.scaleAndAdd(tmp2, tmp2, n, h);

          vec3.sub(tmp3, tmp0, tmp1);
          vec3.sub(tmp4, tmp0, tmp2);

          vec3.scale(tmp3, tmp3, k);
          vec3.scale(tmp4, tmp4, k);

          vec3.add(tmp3, tmp3, tmp1);
          vec3.add(tmp4, tmp4, tmp2);

          const vs = faceToVertices([tmp1, tmp2, tmp4, tmp3] as any);

          vertices.push(...vs);
          for (let i = vs.length / 3; i--; ) {
            normals.push(...(n as any));
            colors.push(...(hintColor as any));
          }
        }
      }

      const k = lcell.grownSinceDate - date;
    }

    return { vertices, colors, normals };
  };

  return update;
};
