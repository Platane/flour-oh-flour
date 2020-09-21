import { vec2, vec3 } from "gl-matrix";
import { getDelaunayTriangulation } from "../../math/getDelaunayTriangulation";
import { epsilon, tmp1, up } from "../../constant";
import {
  getPolygonCenter,
  isInsidePolygon,
  enlargePolygon,
} from "../../math/convexPolygon";
import { getSegmentIntersection } from "../../math/getSegmentIntersection";
import { cells } from "./cells";
import { isInsidePotato } from "./potato";
import { getAltitude } from "./getAltitude";

//
// constant
//
const triangleCloudN = 500;
const triangleCloudDistance = 0.03;
const triangleCloudCellDistance = 0.04;

//
// get another point cloud to fill the void between cells
//
export const fillPoints: vec3[] = cells
  .flat(1)
  .filter((x, i, arr) => i === arr.indexOf(x));

fillPoints.push(...cells.map((cell) => getPolygonCenter([] as any, cell)));

export const flatEnlargedCells = cells.map((cell) =>
  enlargePolygon(cell, triangleCloudCellDistance).map(
    (v) => [v[0], v[1], 0] as vec3
  )
);

let k = 0;
while (k < 100 && fillPoints.length < triangleCloudN) {
  const x = Math.random() * 2 - 1;
  const y = Math.random() * 2 - 1;

  const p: vec2 = [x, y];

  if (
    isInsidePotato(x, y) &&
    !flatEnlargedCells.some((cell) => isInsidePolygon(cell, up, [x, y, 0])) &&
    fillPoints.every(
      (p0) =>
        vec2.squaredDistance(p, p0 as any) >
        triangleCloudDistance * triangleCloudDistance
    )
  ) {
    k = 0;
    p.push(getAltitude(x, y));
    fillPoints.push(p as any);
  } else {
    k++;
  }
}

export const fillIndexes = getDelaunayTriangulation(fillPoints as any[]);

export const debugOriginFillPoints = fillPoints.slice();
export const debugOriginFillIndexes = fillIndexes.slice();

//
// split the triangle edge on cell edge
//

const cellEdges: [vec3, vec3][] = [];
for (const cell of cells)
  for (let u = cell.length; u--; ) {
    const A = cell[u];
    const B = cell[(u + 1) % cell.length];

    if (
      !cellEdges.some(([a, b]) => (a === A && b === B) || (b === A && a === B))
    )
      cellEdges.push([A, B]);
  }

for (let k = 3; k--; ) {
  ll: for (let i = fillIndexes.length; i--; )
    for (let j = 3; j--; ) {
      // each triangle edge
      const a1 = fillIndexes[i][j];
      const a2 = fillIndexes[i][(j + 1) % 3];

      const A1 = fillPoints[a1];
      const A2 = fillPoints[a2];

      for (const [B1, B2] of cellEdges) {
        const out = getSegmentIntersection(
          B1 as vec2,
          B2 as vec2,
          A1 as vec2,
          A2 as vec2
        );

        if (
          out &&
          out[2] > epsilon &&
          1 - out[2] > epsilon &&
          out[3] > epsilon &&
          1 - out[3] > epsilon
        ) {
          const E = vec3.lerp([] as any, B1, B2, out[2]);

          const e = fillPoints.length;
          fillPoints.push(E);

          for (let j = fillIndexes.length; j--; ) {
            if (fillIndexes[j].includes(a1) && fillIndexes[j].includes(a2)) {
              const [indices] = fillIndexes.splice(j, 1);

              // decrement i
              if (j !== i) i = Math.max(0, i - 1);

              let a3 = 0;
              for (const x of indices) if (x !== a1 && x !== a2) a3 = x;

              fillIndexes.push([a1, a3, e], [a2, a3, e]);
            }
          }

          continue ll;
        }
      }
    }
}

// remove triangle that are inside cells
//
// and also the ugly outer shell outside the potato

for (let i = fillIndexes.length; i--; ) {
  getPolygonCenter(
    tmp1,
    fillIndexes[i].map((k) => fillPoints[k] as any)
  );

  if (
    cells.some((cell) => isInsidePolygon(cell, up, tmp1)) ||
    !isInsidePotato(tmp1[0], tmp1[1])
  )
    fillIndexes.splice(i, 1);
}

export const debugAfterFillPoints = fillPoints.slice();
export const debugAfterFillIndexes = fillIndexes.slice();

//
// add cliff
//
for (let i = fillIndexes.length; i--; )
  for (let u = 3; u--; ) {
    const a = fillIndexes[i][u];
    const b = fillIndexes[i][(u + 1) % 3];

    // check if this edge is unique
    let countEdge = 0;
    for (let j = fillIndexes.length; j--; )
      for (let v = 3; v--; ) {
        const c = fillIndexes[j][v];
        const d = fillIndexes[j][(v + 1) % 3];

        if ((a === c && b === d) || (a === d && b === c)) countEdge++;
      }

    if (countEdge > 1) continue;
  }

//   // check sides
// const A = fillPoints[a];
// const B = fillPoints[b];

// const u = cross( [] as any, A,B,zero,up)

// const M1 = vec3.lerp([] as any,A,B,0.5)
// vec3.scaleAndAdd(M1,M1,u,0.1)

// const M2 = vec3.lerp([] as any,A,B,0.5)
// vec3.scaleAndAdd(M2,M2,u,-0.1)

//   const i1 = isInsidePotato(M1[0],M1[1])
//   const i2 = isInsidePotato(M2[0],M2[1])

//   if( i1 && i2 ){

//     let k = fillPoints.length;

//     for( const x of [A,B] ){
//       const p = [x[0] - 0, x[1] - 0, 0] as vec3;

//         vec3.normalize(p, p);
//         p[2] = -5;

//         vec3.normalize(p, p);
//         vec3.scale(p, p, 0.1);

//         vec3.add(p, p, x);

//         return p;
//     }

//   }

// if (countEdge === 1) {

//   fillPoints.push(
//     ...[fillPoints[a], fillPoints[b]]
//       .map((x) => {
//         const p = [x[0] - 0, x[1] - 0, 0] as vec3;

//         vec3.normalize(p, p);
//         p[2] = -5;

//         vec3.normalize(p, p);
//         vec3.scale(p, p, 0.1);

//         vec3.add(p, p, x);

//         return p;
//       })
//       .reverse()
//   );

//   fillIndexes.push([a, b, k], [a, k + 1, k]);
