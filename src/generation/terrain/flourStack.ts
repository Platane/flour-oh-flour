import { vec3 } from "gl-matrix";
import { down, up } from "../../constant";
import { isInsidePolygon } from "../../math/convexPolygon";
import { bagSize } from "../../renderer/geometries/flourBag";
import { raycast } from "../../renderer/raycast";
import { cells } from "./cells";
import { isInsidePotato } from "./potato";
import { distanceToPotatoHull } from "./potatoHull";

//
// define flour stack
//
let flourStackX = 0.00001;
let flourStackY = 0.00001;

while (
  !isInsidePotato(flourStackX, flourStackY) ||
  distanceToPotatoHull(flourStackX, flourStackY, 0.12) < 0.1 ||
  cells.some((cell) => isInsidePolygon(cell, up, [flourStackX, flourStackY, 0]))
) {
  flourStackX = Math.random() * 0.6 + 0.2;
  flourStackY = Math.random() * 0.6 + 0.2;
}

const boxRadius = bagSize * 1.4;
const radiusMax = 0.12;

export const spots: vec3[] = [];

const l = Math.ceil(radiusMax / boxRadius);

for (let dx = -l; dx <= l; dx++)
  for (let dy = -l; dy <= l; dy++) {
    const sx = (((dy + 20) % 2 ? 0 : 0.5) + dx) * boxRadius;
    const sy = dy * boxRadius;

    const x = sx + flourStackX;
    const y = sy + flourStackY;

    const p: vec3 = [x, y, 10];

    const u = raycast(p, down);

    const d = Math.hypot(sx, sy);

    if (
      d < radiusMax &&
      u &&
      isInsidePotato(x, y) &&
      distanceToPotatoHull(x, y, 0.12) > 0.1 &&
      !cells.some((cell) => isInsidePolygon(cell, up, p))
    ) {
      const kMax = Math.min(
        (2 * radiusMax) / (d + 0.01 + 0.005 * Math.random()),
        11
      );

      for (let k = 0; k < kMax; k++) spots.push(u.p);
    }
  }
