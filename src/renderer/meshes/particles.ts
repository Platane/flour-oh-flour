import { vec3 } from "gl-matrix";
import { date } from "../../logic";
import { tmp0, tmp1, z, zero } from "../../constant";
import { lerp } from "../../math/utils";
import { dynamicUpdates, lookAtMatrix3Inv } from "../shared";
import { basicDynamic } from "../materials";

export const particles: {
  positionA: vec3;
  positionB: vec3;

  sizeA: number;
  sizeB: number;

  angleA: number;
  angleB: number;

  startDate: number;
  duration: number;
  color: number[];
}[] = [];

const particleKernel: vec3[] = [
  [-0.2, 0.45, 0],
  [-0.2, -0.45, 0],
  [0.4, 0, 0],
];

dynamicUpdates.push(() => {
  for (let i = particles.length; i--; ) {
    const {
      startDate,
      color,
      duration,
      angleA,
      angleB,
      positionA,
      positionB,
      sizeA,
      sizeB,
    } = particles[i];

    const u = (date - startDate) / duration;

    if (u > 1) {
      particles.slice(i, 1);
    } else {
      const k = 1 - (1 - u) ** 2;

      vec3.lerp(tmp0, positionA, positionB, k);
      const s = lerp(k, sizeA, sizeB);
      const a = lerp(k, angleA, angleB);

      for (let i = 0; i < 3; i++) {
        vec3.copy(tmp1, particleKernel[i]);
        vec3.rotateZ(tmp1, tmp1, zero, a);
        vec3.transformMat3(tmp1, tmp1, lookAtMatrix3Inv);
        vec3.scale(tmp1, tmp1, s);
        vec3.add(tmp1, tmp1, tmp0);

        basicDynamic.pushPoint(tmp1, color, z);
      }
    }
  }
});
