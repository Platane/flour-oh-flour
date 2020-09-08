import { vec3 } from "gl-matrix";
import { date } from "../../logic";
import { tmp0, tmp1, z, zero } from "../../constant";
import { lookAtMatrix3Inv } from "../camera";
import { dynamicVertices, dynamicNormals, dynamicColors } from "./sharedBuffer";
import { lerp } from "../../math/utils";

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

export const update = () => {
  while (particles[0] && particles[0].startDate + particles[0].duration < date)
    particles.shift();

  for (const {
    startDate,
    color,
    duration,
    angleA,
    angleB,
    positionA,
    positionB,
    sizeA,
    sizeB,
  } of particles) {
    const u = (date - startDate) / duration;
    const k = 1 - (1 - u) ** 2;

    vec3.lerp(tmp0, positionA, positionB, k);
    const s = lerp(k, sizeA, sizeB);
    const a = lerp(k, angleA, angleB);

    for (const v of particleKernel) {
      vec3.copy(tmp1, v);
      vec3.rotateZ(tmp1, tmp1, zero, a);
      vec3.transformMat3(tmp1, tmp1, lookAtMatrix3Inv);
      vec3.scale(tmp1, tmp1, s);
      vec3.add(tmp1, tmp1, tmp0);

      dynamicVertices.push(...(tmp1 as number[]));
      dynamicNormals.push(...(z as number[]));
      dynamicColors.push(...(color as number[]));
    }
  }
};
