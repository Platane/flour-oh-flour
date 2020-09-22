import { insideUnitSquare } from "../../math/utils";
import { isInsidePotato } from "./potato";

const getHullIntersection = (
  ox: number,
  oy: number,
  vx: number,
  vy: number,
  a: number,
  b: number,
  k: number
): number => {
  let e = (a + b) / 2;

  if (k <= 0) return e;

  const ex = ox + vx * e;
  const ey = oy + vy * e;

  const eInside = insideUnitSquare(ex, ey) && isInsidePotato(ex, ey);

  return getHullIntersection(
    ox,
    oy,
    vx,
    vy,
    eInside ? e : a,
    eInside ? b : e,
    k - 1
  );
};

const kernel = Array.from({ length: 5 }).map((_, i, arr) => {
  const a = ((i - (arr.length - 1) / 2) * Math.PI) / 3.8;

  return [Math.sin(a), Math.cos(a)];
});

/**
 * return the distance to the closest point of the hull
 *
 */
export const distanceToPotatoHull = (
  x: number,
  y: number,
  maxDistance: number
) => {
  const l = Math.hypot(x, y);

  const vx = x / l;
  const vy = y / l;

  const ux = vy;
  const uy = -vx;

  let min = maxDistance;
  for (const [u, v] of kernel) {
    const tx = vx * v + ux * u;
    const ty = vy * v + uy * u;

    min = Math.min(min, getHullIntersection(x, y, tx, ty, 0, maxDistance, 3));
  }

  return min;
};
