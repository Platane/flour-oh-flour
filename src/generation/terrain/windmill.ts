import { vec2, vec3 } from "gl-matrix";
import { down, up } from "../../constant";
import { isInsidePolygon } from "../../math/convexPolygon";
import { raycast } from "../../renderer/raycast";
import { flatEnlargedCells } from "./fill";
import { distanceToPotatoHull } from "./potatoHull";

const windMillCenterX = (Math.random() - 0.5) * 1.8;
const windMillCenterY = (Math.random() - 0.5) * 1.8;
export const windmillPositions: vec3[] = [];

let r = 0.3;

const p: vec3 = [0, 0, 10] as any;

while (r < 0.4 && windmillPositions.length < 10) {
  const x = (p[0] = 2 * Math.random() - 1);
  const y = (p[1] = 2 * Math.random() - 1);

  r *= 1.001;

  if (
    Math.hypot(windMillCenterX - x, windMillCenterY - y) < r &&
    distanceToPotatoHull(x, y, 0.12) > 0.1 &&
    !flatEnlargedCells.some((cell) => isInsidePolygon(cell, up, p)) &&
    windmillPositions.every((p0) => vec2.distance(p as any, p0 as any) > 0.062)
  ) {
    // const s = 0.018;

    // let d = 0;
    // for (let k = 5; k--; ) {
    //   const sx = x + 0.5 * s * Math.sin((k / 5) * Math.PI * 2);
    //   const sy = y + 0.5 * s * Math.cos((k / 5) * Math.PI * 2);

    //   d = Math.max(d, getAltitude(sx, sy) - z);
    // }
    const u = raycast(p, down);

    if (u) windmillPositions.push(u.p);
  }
}
