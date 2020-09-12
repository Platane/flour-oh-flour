import { vec3 } from "gl-matrix";
import { createWheat } from "./wheat";
import {
  tmp0,
  tmp1,
  tmp2,
  tmp3,
  tmp4,
  zero,
  up,
  z,
  epsilon,
  x,
} from "../../constant";
import { cells, maxTic, date, touches } from "../../logic";
import { clamp } from "../../math/utils";
import { hintColor, wheatColorEnd } from "../colors";
import { getWindDirection } from "./wind";
import { particles } from "../meshes/particles";
import { pushFace } from "../globalBuffers/dynamic";
import {
  isInsidePolygon,
  getPolygonCenter,
  getPolygonBoundingSphereRadius,
} from "../../math/convexPolygon";

const wheatSpace = 0.013;
const lineSpace = wheatSpace;
// const wheatSpace = 0.01;
// const lineSpace = 0.008;

export const createField = (cell: vec3[], i: number) => {
  // compute the center
  const c: vec3 = getPolygonCenter([] as any, cell);

  // compute bounding sphere
  const r = getPolygonBoundingSphereRadius(cell);

  // compute axes
  const u = [] as any;
  const v = [] as any;
  const n = [] as any;

  vec3.sub(v, cell[1], cell[0]);
  vec3.sub(u, cell[2], cell[0]);

  vec3.cross(n, u, v);

  vec3.normalize(n, n);
  vec3.cross(u, n, v);
  vec3.normalize(u, u);

  vec3.cross(v, u, n);

  // origins

  const wheatOrigins: vec3[] = [];

  const um = 1 + Math.ceil(r / lineSpace) * lineSpace;
  const im = 1 + Math.ceil(r / wheatSpace) * wheatSpace;

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

      if (isInsidePolygon(cell, n, tmp1))
        wheatOrigins.push(tmp1.slice() as any);
    }

  const lcell = cells[i];

  const update = () => {
    for (const o of wheatOrigins)
      createWheat(o, getWindDirection(tmp2, o), cells[i].growth);

    if (lcell.type === "grown") {
      if (lcell.tic > 0) {
        //
        // draw a orange border when the field is being clicked

        const k = clamp(lcell.tic / maxTic, 0, 1);

        const h = 0.0005;

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

          pushFace([tmp1, tmp2, tmp4, tmp3], hintColor, n);
        }
      } else {
        //
        // spawn particles when the field is fully grown

        if ((0 | (date * 1000)) % 6 === 0) {
          // debugger;

          const positionA: vec3 = [999999, 999999, 999999];

          while (!isInsidePolygon(cell, n, positionA)) {
            vec3.copy(positionA, c);
            vec3.scaleAndAdd(
              positionA,
              positionA,
              u,
              (Math.random() - 0.5) * 2 * r
            );
            vec3.scaleAndAdd(
              positionA,
              positionA,
              v,
              (Math.random() - 0.5) * 2 * r
            );
          }

          const s = 0.2;

          const l = (1 + Math.random() * 2) * 0.5 * s;

          const positionB = vec3.copy([] as any, positionA);
          vec3.scaleAndAdd(positionB, positionB, up, l);

          const a = Math.random() * 3;

          particles.push({
            positionA,
            positionB,
            angleA: a,
            angleB: a + (Math.random() - 0.5) * 0.2,
            sizeA: s * 0.06,
            sizeB: s * 0.015,
            startDate: date,
            duration: l * 10,
            color: hintColor,
          });
        }
      }
    }

    //
    // explode particles after reap
    if (lcell.type === "growing") {
      const kMax = (0.27 - (date - lcell.growingSinceDate)) * 80;

      for (let k = 0; k < kMax; k++) {
        const positionA: vec3 = [9999, 9999, 9999] as any;

        let x = 0;
        let y = 0;

        while (x * x + y * y < 0.03 || !isInsidePolygon(cell, n, positionA)) {
          x = (Math.random() - 0.5) * 2;
          y = (Math.random() - 0.5) * 2;

          vec3.copy(positionA, c);
          vec3.scaleAndAdd(positionA, positionA, u, r * x);
          vec3.scaleAndAdd(positionA, positionA, v, r * y);
        }

        vec3.subtract(tmp0, positionA, c);

        const d = vec3.length(tmp0);

        vec3.scaleAndAdd(
          tmp0,
          tmp0,
          n,
          Math.max(r * 0.01, (r - d) * (0.7 + Math.random() + 0.7))
        );
        vec3.normalize(tmp0, tmp0);
        const s = 0.5;

        const l = (1 + Math.random() * 5) * 0.2 * s;

        const positionB = vec3.copy([] as any, positionA);
        vec3.scaleAndAdd(positionB, positionB, tmp0, l);

        const a = Math.random() * 3;

        particles.push({
          positionA,
          positionB,
          angleA: a,
          angleB: a + (Math.random() - 0.5) * 0.9,
          sizeA: s * 0.07,
          sizeB: s * 0.1 + s * (Math.random() + 2) * 0.01,
          startDate: date,
          duration: l * 0.45,
          // color: [0, 0, Math.random()],
          color: wheatColorEnd.map((x) =>
            clamp(x + 0.37 * (Math.random() - 0.5), 0, 1)
          ),
        });
      }
    }

    //
    // spawn particles for each touches on the field
    for (const touch of touches) {
      if (touch.i === i)
        for (let k = 0; k < (0.12 - (date - touch.date)) * 8; k++) {
          const positionA = vec3.copy([] as any, touch.p);

          const s = 0.5;

          vec3.copy(tmp0, zero);
          const phi = Math.random() * Math.PI * 2;
          vec3.scaleAndAdd(tmp0, tmp0, u, Math.sin(phi));
          vec3.scaleAndAdd(tmp0, tmp0, v, Math.cos(phi));

          vec3.scaleAndAdd(positionA, positionA, tmp0, Math.random() * s * 0.4);

          const l = (1 + 0.8 * Math.random()) * 0.23;

          vec3.scaleAndAdd(tmp0, tmp0, n, Math.random() + 0.1);
          vec3.normalize(tmp0, tmp0);

          const positionB = vec3.copy([] as any, positionA);
          vec3.scaleAndAdd(positionB, positionB, tmp0, l);

          const a = Math.random() * 3;

          particles.push({
            positionA,
            positionB,
            angleA: a,
            angleB: a + (Math.random() - 0.5) * 0.9,
            sizeA: s * 0.07,
            sizeB: s * 0.1 + s * (Math.random() + 2) * 0.01,
            startDate: date,
            duration: l,
            color: wheatColorEnd.map((x) =>
              clamp(x + 0.37 * (Math.random() - 0.5), 0, 1)
            ),
          });
        }
    }
  };

  return update;
};
