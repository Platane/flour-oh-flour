import { vec3 } from "gl-matrix";
import { date } from "../../logic";
import { tmp0, tmp1, z, zero } from "../../constant";
import { lookAtMatrix3Inv } from "../camera";
import {
  vertices,
  normals,
  colors,
  n,
  incrementN,
} from "../globalBuffers/dynamic";
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

        vertices[n * 9 + i * 3 + 0] = tmp1[0];
        vertices[n * 9 + i * 3 + 1] = tmp1[1];
        vertices[n * 9 + i * 3 + 2] = tmp1[2];

        colors[n * 9 + i * 3 + 0] = color[0];
        colors[n * 9 + i * 3 + 1] = color[1];
        colors[n * 9 + i * 3 + 2] = color[2];

        normals[n * 9 + i * 3 + 0] = 0;
        normals[n * 9 + i * 3 + 1] = 0;
        normals[n * 9 + i * 3 + 2] = 1;
      }

      incrementN();
    }
  }
};
