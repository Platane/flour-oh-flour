import { mat4 } from "gl-matrix";
import { tr0 } from "../../constant";
import { windmillPositions } from "../../generation/terrain/windmill";
import { createWindmill } from "../geometries/windmill";

console.log("--as");

const updates = windmillPositions.map((p) => {
  const tr = [] as any;
  mat4.fromTranslation(tr, p);
  // mat4.multiply(tr, tr, mat4.fromTranslation(tr0, p));
  // mat4.fromScaling(tr, [0.02, 0.02, 0.02]);
  mat4.multiply(tr, tr, mat4.fromScaling(tr0, [0.02, 0.02, 0.02]));
  return createWindmill(tr);
});

export const update = () => updates.forEach((u) => u());
