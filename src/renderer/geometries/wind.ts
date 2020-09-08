import { vec3 } from "gl-matrix";
import { date } from "../../logic";
import { clamp } from "../../math/utils";
import { hoveredPosition, hoveredDate } from "../../hover";
import { epsilon } from "../../constant";

const scale = 1;

const u: vec3 = [] as any;
const f: vec3 = [] as any;

let a = 0;
let lastDate = 0;
let vD = 0;
let d = 0;

export const getWindDirection = (out: vec3, o: vec3) => {
  const angle =
    date * 1.3 +
    0.18 * Math.sin(date * 2.7 + o[0] ** 2 * scale ** 2) +
    0.3 * Math.sin(date * 1.7 + o[2] * 2 * scale) +
    0.2 * Math.sin(o[2] * 782 * scale + o[0] * 2132 * scale);

  const strength =
    (4 +
      1 * Math.sin(date * 2 + o[0] * scale) +
      2 * Math.sin(date * 3.8 + o[2] * 2 * scale)) /
    7;

  out[0] = Math.cos(angle) * strength;
  out[1] = 2;
  out[2] = Math.sin(angle) * strength;

  vec3.normalize(out, out);

  if (lastDate !== date) {
    const tension = 160;
    const friction = 12;
    const dTarget = date - hoveredDate < 0.15 ? 1 : 0;
    const a = tension * (dTarget - d) - friction * vD;
    vD += a * (date - lastDate);
    d += vD * (date - lastDate);

    lastDate = date;
  }

  // clamp(1 - (date - hoveredDate) / 0.16, 0, 1) ** 4;

  if (hoveredPosition && Math.abs(d) > epsilon) {
    vec3.sub(u, o, hoveredPosition);
    const l = vec3.length(u);

    const ll =
      Math.max(
        l + Math.sin(o[2] * 783 * scale + o[0] * 132 * scale + date) * 0.05,
        0.027 * scale
      ) * 6;

    vec3.scaleAndAdd(out, out, u, clamp(d / (l * ll ** 6), -3, 5));

    vec3.normalize(out, out);
  }

  return out;
};
