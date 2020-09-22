import { mat4, vec3 } from "gl-matrix";
import { cells } from "../../generation/terrain/cells";
import { spots } from "../../generation/terrain/flourStack";
import { date, flourBags as logicFlourBags } from "../../logic";
import { getPolygonCenter } from "../../math/convexPolygon";
import { bagSize, createFlourBag } from "../geometries/flourBag";
import { basicDynamic, basicStatic } from "../materials";
import { dynamicUpdates } from "../shared";

const flourBags: {
  a: vec3;
  b: vec3;
  c: vec3;
  date0: number;
  duration: number;
}[] = [];

const transform: mat4 = [] as any;

let k = 0;

dynamicUpdates.push(() => {
  while (logicFlourBags[k] !== undefined) {
    const cellIndex = logicFlourBags[k];

    const cell = cells[cellIndex];

    const a = getPolygonCenter([] as any, cell);
    a[1] += bagSize;

    const s = spots[Math.floor(Math.random() * spots.length)];

    const b: vec3 = [s[0], s[1], s[2] + bagSize / 2];

    s[2] += bagSize * 1.03;

    const c: vec3 = [(a[0] + b[0]) / 2, (a[2] + b[2]) / 2, 1.2];

    k++;
    flourBags.push({
      a,
      b,
      c,
      date0: date,
      duration: (vec3.distance(a, c) + vec3.distance(c, b)) * 0.4,
    });
  }

  for (let i = flourBags.length; i--; ) {
    const { a, b, c, date0, duration } = flourBags[i];

    const k = Math.min((date - date0) / duration, 1);

    const p: vec3 = [
      //
      a[0] * (1 - k) * (1 - k) + c[0] * (1 - k) * k + b[0] * k * k,
      a[1] * (1 - k) * (1 - k) + c[1] * (1 - k) * k + b[1] * k * k,
      a[2] * (1 - k) * (1 - k) + c[2] * (1 - k) * k + b[2] * k * k,
    ];

    mat4.fromTranslation(transform, p);

    if (k === 1) {
      flourBags.splice(i, 1);
      createFlourBag(transform, basicStatic);
    } else {
      createFlourBag(transform, basicDynamic);
    }
  }
});
