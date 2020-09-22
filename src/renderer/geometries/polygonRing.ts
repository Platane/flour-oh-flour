import { vec3 } from "gl-matrix";
import { tmp0, tmp1, tmp2, tmp3, tmp4 } from "../../constant";
import { hintColor } from "../colors";
import { basicDynamic } from "../materials";

export const createPolygonRing = (
  k: number,
  cell: vec3[],
  center: vec3,
  normal: vec3
) => {
  const h = 0.0005;

  vec3.copy(tmp0, center);
  vec3.scaleAndAdd(tmp0, tmp0, normal, h);

  for (let i = cell.length; i--; ) {
    const A = cell[i];
    const B = cell[(i + 1) % cell.length];

    vec3.copy(tmp1, A);
    vec3.copy(tmp2, B);
    vec3.scaleAndAdd(tmp1, tmp1, normal, h);
    vec3.scaleAndAdd(tmp2, tmp2, normal, h);

    vec3.sub(tmp3, tmp0, tmp1);
    vec3.sub(tmp4, tmp0, tmp2);

    vec3.scale(tmp3, tmp3, k);
    vec3.scale(tmp4, tmp4, k);

    vec3.add(tmp3, tmp3, tmp1);
    vec3.add(tmp4, tmp4, tmp2);

    basicDynamic.pushFace([tmp1, tmp2, tmp4, tmp3], hintColor, normal);
  }
};
