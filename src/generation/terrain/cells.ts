import { vec2, vec3 } from "gl-matrix";
import { tmp1, tmp2, up } from "../../constant";
import { getVoronoiTesselation } from "../../math/getVoronoiTesselation";
import {
  getPolygonArea,
  getPolygonBoundingSphereRadius,
} from "../../math/convexPolygon";
import { isInsidePotato } from "./potato";
import { insideUnitSquare, shuffle } from "../../math/utils";
import { getAltitude } from "./getAltitude";
import { distanceToPotatoHull } from "./potatoHull";

//
// constant
//
const cellN = 8;
const cellCloudN = 50;

//
// output
//
export const cells: vec3[][] = [];

//
// pick random point inside the hull
//
const points: vec2[] = [];
while (points.length < cellCloudN) {
  const x = Math.random() * 2 - 1;
  const y = Math.random() * 2 - 1;

  const p: vec2 = [x, y];

  if (isInsidePotato(x, y)) points.push(p);
}

//
// pick some cells
//

const { vertices: v, faces } = getVoronoiTesselation(points);

shuffle(faces);

export const vertices: vec3[] = v as any;
export const debugFaces = faces.slice();

for (const v of vertices) {
  v[2] = insideUnitSquare(v[0], v[1]) ? getAltitude(v[0], v[1]) : 0;
}

const frozenVertices: boolean[] = [];

while (faces.length && cells.length < cellN) {
  const indexes = faces.shift()!;

  const points = indexes.map((i) => vertices[i]);

  // if some point is outside the hull
  // ignore
  if (
    points.some(
      (v) =>
        !insideUnitSquare(v[0], v[1]) ||
        !isInsidePotato(v[0], v[1]) ||
        distanceToPotatoHull(v[0], v[1], 0.2) < 0.001
    )
  )
    continue;

  // // if the shape have edge too small
  // // ignore
  // // because it's causing issue with the inside detection
  // if (
  //   points.some((_, i, arr) => {
  //     return (
  //       vec2.distance(arr[i] as any, arr[(i + 1) % arr.length] as any) < 0.005
  //     );
  //   })
  // )
  //   continue;

  // if the shape is not pretty enough
  // ignore

  const boundingSphereArea =
    getPolygonBoundingSphereRadius(points) ** 2 * Math.PI;

  const hullArea = getPolygonArea(points);
  const hullCompactness = hullArea / boundingSphereArea;

  if (hullArea < 0.006 || hullCompactness < 0.3) continue;

  // some point are already frozen,
  // meaning we can no longer move them
  const anchors = indexes.filter((i) => frozenVertices[i]);

  // if more than two point are frozen
  // ignore
  if (anchors.length > 2) continue;

  // get 3 point to serve as anchor
  // those point will define the plane of the hull
  // all the other point will be move to fit inside the plane
  //
  // its better if the anchor points are far away from each other
  while (anchors.length < 3) {
    let maxD = 0;
    let bestI = 0;

    for (const i of indexes) {
      if (!anchors.includes(i)) {
        const d = anchors.reduce(
          (sum, j) => sum + vec3.distance(vertices[i], vertices[j]),
          0
        );

        if (d > maxD) {
          bestI = i;
          maxD = d;
        }
      }
    }

    anchors.push(bestI);
  }

  // normal of the final plane
  const n = vec3.cross(
    [] as any,
    vec3.sub(tmp1, vertices[anchors[1]], vertices[anchors[0]]),
    vec3.sub(tmp2, vertices[anchors[1]], vertices[anchors[2]])
  );
  vec3.normalize(n, n);

  const dzs: number[] = [];

  // prepare to move the vertices inside the plan
  for (let i = 0; i < indexes.length; i++) {
    const d = vec3.dot(
      n,
      vec3.sub(tmp1, vertices[indexes[i]], vertices[anchors[0]])
    );

    const dz = d / vec3.dot(n, up);

    dzs[i] = dz;
  }

  // ignore if we need to move the point too much
  if (dzs.some((dz) => Math.abs(dz) > 0.05)) continue;

  for (let i = 0; i < indexes.length; i++) {
    vec3.scaleAndAdd(vertices[indexes[i]], vertices[indexes[i]], up, -dzs[i]);

    frozenVertices[indexes[i]] = true;
  }

  // add to the cell list
  cells.push(points);
}
