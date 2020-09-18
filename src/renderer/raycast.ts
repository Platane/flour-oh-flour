import { vec3, mat4, mat3 } from "gl-matrix";
import { epsilon } from "../constant";
import { triangles } from "../generation/terrain/mesh";
import { isInsidePolygon } from "../math/convexPolygon";
import { worldMatrix, cameraOrigin } from "./shared";

const rayDirection: vec3 = [] as any;
const rayOrigin: vec3 = [] as any;

export const raycastFromScreen = (x: number, y: number) => {
  const m = mat4.invert([] as any, worldMatrix);

  vec3.copy(rayOrigin, cameraOrigin);

  // get the ray direction
  vec3.transformMat4(rayDirection, [x, y, 0.5], m);
  vec3.sub(rayDirection, rayDirection, rayOrigin);
  vec3.normalize(rayDirection, rayDirection);

  return raycast(rayOrigin, rayDirection);
};

const p: vec3 = [] as any;

export const raycast = (origin: vec3, direction: vec3) => {
  let bestT = Infinity;
  let bestP: vec3 = [0, 0, 0];
  let bestI = -1;

  for (let i = triangles.length; i--; ) {
    const { vertices, normal } = triangles[i];

    const [A] = vertices;

    const k = vec3.dot(normal, direction);

    if (Math.abs(k) > epsilon) {
      const t =
        (normal[0] * (A[0] - origin[0]) +
          normal[1] * (A[1] - origin[1]) +
          normal[2] * (A[2] - origin[2])) /
        k;

      if (t > epsilon && t < bestT) {
        vec3.copy(p, origin);
        vec3.scaleAndAdd(p, p, direction, t);

        if (isInsidePolygon(vertices, normal, p)) {
          bestT = t;
          bestP[0] = p[0];
          bestP[1] = p[1];
          bestP[2] = p[2];
          bestI = i;
        }
      }
    }
  }

  if (bestI >= 0) return { p: bestP, t: bestT, i: bestI };
};
