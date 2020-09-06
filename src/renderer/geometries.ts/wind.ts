import { vec3 } from "gl-matrix";
import { date } from "../../logic";
import { clamp } from "../../math/utils";
import { hoveredPosition, hoveredDate } from "../../hover";

const scale = 1;

const u: vec3 = [] as any;
const f: vec3 = [] as any;

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

  const d = clamp(1 - (date - hoveredDate) / 0.16, 0, 1) ** 4;

  if (hoveredPosition && d) {
    vec3.sub(u, o, hoveredPosition);
    const l = vec3.length(u);

    const ll = Math.max(l, 0.02 * scale) * 6;

    vec3.scaleAndAdd(out, out, u, Math.min(6, d / (l * ll ** 3)));

    vec3.normalize(out, out);
  }

  return out;
};
