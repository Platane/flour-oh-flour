import { vec3 } from "gl-matrix";
import { tmp0, tmp1, tmp2, zero, up } from "../../constant";
import { maxTic, date, touches, maxGrowth } from "../../logic";
import { clamp } from "../../math/utils";
import { hintColor, wheatColorEnd } from "../colors";
import { particles } from "../meshes/particles";
import {
  isInsidePolygon,
  getPolygonCenter,
  getPolygonBoundingSphereRadius,
} from "../../math/convexPolygon";
import { cells } from "../../generation/terrain/cells";
import { getWindDirection } from "../../logic/wind";
import { createWheat } from "../geometries/wheat";
import { dynamicUpdates } from "../shared";
import { cells as logicCells } from "../../logic/index";
import { createPolygonRing } from "../geometries/polygonRing";

const wheatSpace = 0.026;
const lineSpace = wheatSpace;
// const wheatSpace = 0.01;
// const lineSpace = 0.008;

const windDirection: vec3 = [] as any;

for (let i = cells.length; i--; ) {
  const cell = cells[i];
  const logicCell = logicCells[i];

  // compute the center
  const center: vec3 = getPolygonCenter([] as any, cell);

  // compute bounding sphere
  const radius = getPolygonBoundingSphereRadius(cell);

  // compute axes
  const u = [] as any;
  const v = [] as any;
  const normal = [] as any;

  vec3.sub(v, cell[1], cell[0]);
  vec3.sub(u, cell[2], cell[0]);

  vec3.cross(normal, v, u);
  vec3.normalize(normal, normal);

  vec3.cross(u, normal, v);
  vec3.normalize(u, u);

  vec3.cross(v, u, normal);

  // origins

  const wheatOrigins: vec3[] = [];

  const um = 1 + Math.ceil(radius / lineSpace) * lineSpace;
  const im = 1 + Math.ceil(radius / wheatSpace) * wheatSpace;

  for (let ul = -um; ul <= um; ul += lineSpace)
    for (let il = -im; il <= im; il += wheatSpace) {
      vec3.copy(tmp1, center);
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

      if (isInsidePolygon(cell, normal, tmp1))
        wheatOrigins.push(tmp1.slice() as any);
    }

  const update = () => {
    // for (const o of wheatOrigins) createWheat(o, [0, 0, 1], 1);
    for (const o of wheatOrigins) {
      getWindDirection(windDirection, o);
      createWheat(o, windDirection, logicCell.growth / maxGrowth);
    }

    //
    // draw a orange border when the field is being clicked
    if (logicCell.type === "grown" && logicCell.tic > 0) {
      const k = clamp(logicCell.tic / maxTic, 0, 1);

      createPolygonRing(k, cell, center, normal);
    }

    //
    // spawn particles when the field is fully grown
    if (logicCell.type === "grown" && logicCell.tic <= 0) {
      if ((0 | (date * 1754 + i)) % 15 === 0) {
        // debugger;

        const positionA: vec3 = [999999, 999999, 999999];

        while (!isInsidePolygon(cell, normal, positionA)) {
          vec3.copy(positionA, center);
          vec3.scaleAndAdd(
            positionA,
            positionA,
            u,
            (Math.random() - 0.5) * 2 * radius
          );
          vec3.scaleAndAdd(
            positionA,
            positionA,
            v,
            (Math.random() - 0.5) * 2 * radius
          );
        }

        const s = 0.25;

        const l = (1 + Math.random() * 2) * 0.3 * s;

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
          duration: l * 15,
          color: hintColor,
        });
      }
    }

    //
    // explode particles after reap
    if (logicCell.type === "growing") {
      const kMax = (0.27 - (date - logicCell.growingSinceDate)) * 80;

      for (let k = 0; k < kMax; k++) {
        const positionA: vec3 = [9999, 9999, 9999] as any;

        let x = 0;
        let y = 0;

        while (
          x * x + y * y < 0.03 ||
          !isInsidePolygon(cell, normal, positionA)
        ) {
          x = (Math.random() - 0.5) * 2;
          y = (Math.random() - 0.5) * 2;

          vec3.copy(positionA, center);
          vec3.scaleAndAdd(positionA, positionA, u, radius * x);
          vec3.scaleAndAdd(positionA, positionA, v, radius * y);
        }

        vec3.subtract(tmp0, positionA, center);

        const d = vec3.length(tmp0);

        vec3.scaleAndAdd(
          tmp0,
          tmp0,
          normal,
          Math.max(radius * 0.01, (radius - d) * (0.7 + Math.random() + 0.7))
        );
        vec3.normalize(tmp0, tmp0);
        const s = 0.2;

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
          color:
            Math.random() > 0.7
              ? wheatColorEnd.map((x) =>
                  clamp(x + 0.37 * (Math.random() - 0.5), 0, 1)
                )
              : hintColor,
        });
      }
    }

    //
    // spawn particles for each touches on the field
    for (const touch of touches) {
      if (touch.i === i)
        for (let k = 0; k < (0.12 - (date - touch.date)) * 12; k++) {
          const positionA = vec3.copy([] as any, touch.p);

          const s = 0.18;

          vec3.copy(tmp0, zero);
          const phi = Math.random() * Math.PI * 2;
          vec3.scaleAndAdd(tmp0, tmp0, u, Math.sin(phi));
          vec3.scaleAndAdd(tmp0, tmp0, v, Math.cos(phi));

          vec3.scaleAndAdd(positionA, positionA, tmp0, Math.random() * s * 0.4);

          const l = (1 + 0.8 * Math.random()) * 0.06;

          vec3.scaleAndAdd(tmp0, tmp0, normal, Math.random() + 0.1);
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
            duration: l * 2,
            color:
              Math.random() > 0.7
                ? wheatColorEnd.map((x) =>
                    clamp(x + 0.37 * (Math.random() - 0.5), 0, 1)
                  )
                : hintColor,
          });
        }
    }
  };

  dynamicUpdates.push(update);
}
