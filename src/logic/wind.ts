import { vec3 } from "gl-matrix";
import { date, touches } from ".";
import { epsilon } from "../constant";
import { hoveredDate, hoveredPosition } from "../hover";

const scale = 1;

const u: vec3 = [] as any;

const hand: vec3 = [0, 0, 0] as any;

let lastDate = 0;
let vD = 0;
let d = 0;

export const getWindDirection = (out: vec3, o: vec3) => {
  //
  // generate wind gradient
  // based on pseudo random value from the position
  const angle =
    date * 1.3 +
    0.18 * Math.sin(date * 2.7 + o[0] ** 2 * scale ** 2) +
    0.3 * Math.sin(date * 1.7 + o[1] * 2 * scale) +
    0.2 * Math.sin(o[1] * 782 * scale + o[0] * 2132 * scale);

  const strength =
    (4 +
      1 * Math.sin(date * 2 + o[0] * scale) +
      2 * Math.sin(date * 3.8 + o[1] * 2 * scale)) /
    7;

  out[0] = Math.cos(angle) * strength;
  out[1] = Math.sin(angle) * strength;
  out[2] = 2;

  vec3.normalize(out, out);

  //
  // change the gradient when it's hovered
  //
  // update d which is the strength of the hover effect ( which decay hover time )
  if (lastDate !== date) {
    let dTarget = 0;

    if (touches.length && date - touches[touches.length - 1].date < 0.052) {
      dTarget = 3.1;
      vec3.copy(hand, touches[touches.length - 1].p);
    } else if (hoveredPosition && date - hoveredDate < 0.12) {
      dTarget = 1;
      vec3.copy(hand, hoveredPosition);
    }

    const tension = 160;
    const friction = 12;
    const a = tension * (dTarget - d) - friction * vD;
    vD += a * (date - lastDate);
    d += vD * (date - lastDate);

    lastDate = date;
  }

  if (Math.abs(d) > epsilon) {
    vec3.sub(u, o, hand);
    const l = vec3.length(u);

    const rand =
      Math.sin(o[1] * 783 * scale + o[0] * 132 * scale + date) * 0.003;

    const ll = Math.max(l + rand, 0.001);

    const f = (d / (0.0001 + l * ll)) * 0.016;

    vec3.scaleAndAdd(out, out, u, f);

    vec3.normalize(out, out);
  }

  // out[0] = 0;
  // out[1] = 0;
  // out[2] = 1;

  vec3.normalize(out, out);

  return out;
};
