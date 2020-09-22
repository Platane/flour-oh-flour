import { mat4 } from "gl-matrix";
import { tr0 } from "../../constant";
import { windmillPositions } from "../../generation/terrain/windmill";
import { createWindmill } from "../geometries/windmill";
import { dynamicUpdates } from "../shared";

for (const p of windmillPositions) {
  const tr = [] as any;
  mat4.fromTranslation(tr, p);
  mat4.multiply(tr, tr, mat4.fromScaling(tr0, [0.02, 0.02, 0.02]));
  mat4.multiply(tr, tr, mat4.fromZRotation(tr0, 1 + Math.random() * 1.2));

  dynamicUpdates.push(createWindmill(tr));
}
