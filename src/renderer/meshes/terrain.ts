import { generatePerlinNoise } from "../../math/generatePerlinNoise";
import { vec2, vec3, mat4 } from "gl-matrix";
import { getDelaunayTriangulation } from "../../math/getDelaunayTriangulation";
import { cells as logicCells, maxGrowth } from "../../logic";
import { epsilon, tmp1, tmp2, up, z } from "../../constant";
import { createField } from "../geometries/field";
import { n, pushFace } from "../globalBuffers/static";
import { getVoronoiTesselation } from "../../math/getVoronoiTesselation";
import {
  getPolygonArea,
  getPolygonBoundingSphereRadius,
  getPolygonCenter,
  isInsidePolygon,
  enlargePolygon,
} from "../../math/convexPolygon";
import { getSegmentIntersection } from "../../math/getSegmentIntersection";
import { hillColor, dirtColor } from "../colors";

//
// constant
//
const cellN = 8;
const cellCloudN = 80;
const triangleCloudN = 1200;
const triangleCloudDistance = 0.00005;

//
// generate an interesting potato shaped hull
//
const gauss = (cx: number, cy: number, tau: number, x: number, y: number) => {
  const dx = cx - x;
  const dy = cy - y;

  var d = (dx * dx + dy * dy) / (tau * tau);

  return Math.exp(-0.5 * d);
};

const potatoPerlin = generatePerlinNoise(1, 1, 0.35);

const potatoBlobs = Array.from({ length: 6 }, () => [
  Math.random() * 0.46 + 0.27,
  Math.random() * 0.46 + 0.27,

  (1 + Math.random()) * 0.1,
]);

export const isInsidePotato = (x: number, y: number) => {
  const g = potatoBlobs.reduce(
    (sum, [cx, cy, tau]) => sum + gauss(cx, cy, tau, x, y),
    0
  );
  const p = potatoPerlin(x, y) * 1.7;

  const d = 0.5 - Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);

  const v = g + p * (0.4 + d * 0.6);

  return v > 0.5;
};

//
// pick random point inside the hull
//
const potatoPoints: vec2[] = [];
while (potatoPoints.length < cellCloudN) {
  const x = Math.random();
  const y = Math.random();

  const p: vec2 = [x, y];

  if (
    isInsidePotato(x, y) &&
    potatoPoints.every((p0) => vec2.squaredDistance(p, p0) > 0.0005)
  )
    potatoPoints.push(p);
}

//
// generate the height function
//
export const potatoCenter: vec2 = getPolygonCenter(
  [] as any,
  potatoPoints as any
) as any;

const insideUnitSquare = (x: number, y: number) =>
  x >= 0 && x < 1 && y >= 0 && y < 1;

const distanceToHull = (x: number, y: number) => {
  const v = vec2.set([] as any, x, y);
  vec2.sub(v, v, potatoCenter);
  vec2.normalize(v, v);

  let minD = Infinity;

  const L = 0.15;

  for (let k = 26; k--; ) {
    const i = epsilon + Math.random() * L;
    const j = i * (Math.random() - 0.5) * 0.7;

    const px = x + i * v[0] + j * v[1];
    const py = y + i * v[1] - j * v[0];

    const d = i * i + j * j;
    if (d < minD && (!insideUnitSquare(px, py) || !isInsidePotato(px, py)))
      minD = d;
  }

  return Math.min(1, Math.sqrt(minD) / L);
};

const altitudePerlin0 = generatePerlinNoise(3, 3, 0.14);
const altitudePerlin1 = generatePerlinNoise(3, 3, 0.32);
const altitudePerlin2 = generatePerlinNoise(3, 3, 0.73);

const getAltitude = (x: number, y: number) => {
  // return 0;

  let h = -0.3;
  h += altitudePerlin0(x + 1.2, y + 1.16) * 0.5;
  h += altitudePerlin1(x + 1.7, y + 1.6) * 0.6;
  h += altitudePerlin2(x + 1.57, y + 1.2) * 0.8;

  const d = distanceToHull(x, y);

  return (0.7 * d + h * d) * 0.2;
};

//
// pick some cells
//

const cellCandidates = getVoronoiTesselation(potatoPoints);
const cellCandidatesVertices = cellCandidates.vertices.map(
  ([x, y]: any) =>
    [x, y, insideUnitSquare(x, y) ? getAltitude(x, y) : 0] as vec3
);
const frozenVertices: boolean[] = [];

export const cells: vec3[][] = [];

while (cellCandidates.faces.length && cells.length < cellN) {
  const k = Math.floor(Math.random() * cellCandidates.faces.length);
  const [indexes] = cellCandidates.faces.splice(k, 1);

  const vertices = indexes.map((i) => cellCandidatesVertices[i]);

  // if some point is outside the hull
  // ignore
  if (
    vertices.some(
      (v) => !insideUnitSquare(v[0], v[1]) || distanceToHull(v[0], v[1]) < 0.14
    )
  )
    continue;

  // if the shape have edge too small
  // ignore
  // because it's causing issue with the inside detection
  if (
    vertices.some((_, i, arr) => {
      return (
        vec2.distance(arr[i] as any, arr[(i + 1) % arr.length] as any) < 0.005
      );
    })
  )
    continue;

  // if the shape is not pretty enough
  // ignore

  const boundingSphereArea =
    getPolygonBoundingSphereRadius(vertices) ** 2 * Math.PI;

  const hullArea = getPolygonArea(vertices);
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
          (sum, j) =>
            sum +
            vec3.distance(cellCandidatesVertices[i], cellCandidatesVertices[j]),
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
    vec3.sub(
      tmp1,
      cellCandidatesVertices[anchors[1]],
      cellCandidatesVertices[anchors[0]]
    ),
    vec3.sub(
      tmp2,
      cellCandidatesVertices[anchors[1]],
      cellCandidatesVertices[anchors[2]]
    )
  );
  vec3.normalize(n, n);

  const dzs: number[] = [];

  // prepare to move the vertices inside the plan
  for (let i = 0; i < indexes.length; i++) {
    if (anchors.includes(i)) {
      dzs[i] = 0;
    } else {
      const d = vec3.dot(
        n,
        vec3.sub(
          tmp1,
          cellCandidatesVertices[indexes[i]],
          cellCandidatesVertices[anchors[0]]
        )
      );

      const dz = d / vec3.dot(n, z);

      dzs[i] = dz;
    }
  }

  // ignore if we need to move the point too much
  if (dzs.some((dz) => Math.abs(dz) > 0.05)) continue;

  for (let i = 0; i < indexes.length; i++) {
    vec3.scaleAndAdd(
      cellCandidatesVertices[indexes[i]],
      cellCandidatesVertices[indexes[i]],
      z,
      -dzs[i]
    );

    frozenVertices[indexes[i]] = true;
  }

  // add to the cell list
  cells.push(vertices);
}

//
// get another point cloud to fill the void between cells
//

export const fillPoints: vec3[] = cells
  .flat(1)
  .filter((x, i, arr) => i === arr.indexOf(x));

fillPoints.push(...cells.map((cell) => getPolygonCenter([] as any, cell)));

const flatEnlargedCells = cells.map((cell) =>
  enlargePolygon(cell, 0.04).map((v) => [v[0], v[1], 0] as vec3)
);

let k = 0;
while (k < 100 && fillPoints.length < triangleCloudN) {
  const x = Math.random();
  const y = Math.random();

  const p: vec2 = [x, y];

  if (
    isInsidePotato(x, y) &&
    !flatEnlargedCells.some((cell) => isInsidePolygon(cell, z, [x, y, 0])) &&
    fillPoints.every(
      (p0) => vec2.squaredDistance(p, p0 as any) > triangleCloudDistance
    )
  ) {
    k = 0;
    p.push(getAltitude(x, y));
    fillPoints.push(p as any);
  } else {
    k++;
  }
}

export const originalFillPoints = fillPoints.slice();

export const fillIndexes = getDelaunayTriangulation(fillPoints as any[]);
export const originalFillIndexes = fillIndexes.slice();

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

//
// remove triangle that are inside cells
//
for (let i = fillIndexes.length; i--; ) {
  const c = getPolygonCenter(
    [] as any,
    fillIndexes[i].map((k) => fillPoints[k] as any)
  );

  if (cells.some((cell) => isInsidePolygon(cell, z, [c[0], c[1], 0])))
    fillIndexes.splice(i, 1);
}

//
// remove ugly outer shell
//
// TODO
for (let i = fillIndexes.length; i--; ) {
  const c = getPolygonCenter(
    tmp1,
    fillIndexes[i].map((k) => fillPoints[k])
  );

  if (!isInsidePotato(c[0], c[1])) fillIndexes.splice(i, 1);
}

//
// form the triangles
//

for (const p of fillPoints)
  if (p.length === 2) (p as any).push(getAltitude(p[0], p[1]));

// currently only the cells are activatable,
// the active face points to the index of the face
export const activeFaces: number[] = [];

const fieldsUpdates: (() => void)[] = [];

// const transform = mat4.create();
const transform = mat4.create();

mat4.multiply(transform, transform, mat4.fromScaling([] as any, [2, -1, 2]));
mat4.multiply(
  transform,
  transform,
  mat4.fromTranslation([] as any, [-potatoCenter[0], 0, -potatoCenter[1]])
);
mat4.multiply(transform, transform, mat4.fromXRotation([] as any, Math.PI / 2));

// mat4.fromScaling([] as any, 2);

for (const cell of cells) {
  const vertices = cell.map((v) => vec3.transformMat4([] as any, v, transform));

  const nn = vec3.cross(
    [] as any,
    vec3.sub(tmp1, vertices[1], vertices[0]),
    vec3.sub(tmp2, vertices[2], vertices[0])
  );
  if (nn[1] < 0) {
    vertices.reverse();
    vec3.scale(nn, nn, -1);
  }

  vec3.normalize(nn, nn);

  let a = n;
  pushFace(vertices, [Math.random(), Math.random(), Math.random()], nn);

  const i = logicCells.length;
  logicCells.push({
    growth: maxGrowth * 0.9,
    area: getPolygonArea(vertices),
    type: "growing",
  } as any);

  fieldsUpdates.push(createField(vertices, up, i));

  for (let j = a; j < n; j++) activeFaces[j] = i;
}

for (const indexes of fillIndexes) {
  const vertices = indexes.map((k) =>
    vec3.transformMat4([] as any, fillPoints[k], transform)
  );

  // ensure that the faces are pointed to the up axis
  const nn = vec3.cross(
    [] as any,
    vec3.sub(tmp1, vertices[1], vertices[0]),
    vec3.sub(tmp2, vertices[2], vertices[0])
  );
  if (nn[1] < 0) {
    vertices.reverse();
    vec3.scale(nn, nn, -1);
  }

  vec3.normalize(nn, nn);

  pushFace(vertices, hillColor, nn);
}

// // add windmills
// for (let u = 5; u--; ) {
//   let x = 1;
//   let y = 1;
//   while (x * x + y * y > 0.9) {
//     x = Math.random() * 2 - 1;
//     y = Math.random() * 2 - 1;
//   }

//   const { vertices, colors } = createWindmill();

//   const s = 0.035;
//   const o = [x, h(x, y), y];
//   const a = Math.random() * Math.PI * 2;

//   for (let i = 0; i < vertices.length; i += 3) {
//     tmp0[0] = vertices[i + 0];
//     tmp0[1] = vertices[i + 1];
//     tmp0[2] = vertices[i + 2];

//     vec3.rotateY(tmp0, tmp0, zero, a);

//     vertices[i + 0] = tmp0[0] * s + o[0];
//     vertices[i + 1] = tmp0[1] * s + o[1];
//     vertices[i + 2] = tmp0[2] * s + o[2];
//   }

//   staticVertices.push(...vertices);
//   staticColors.push(...colors);
// }

// const fieldsUpdates = cellFaces.map((cell, i) =>
//   createField(cell as any, direction, i)
// );

export const update = () => {
  // add dynamic fields
  // for (const update of fieldsUpdates) update();
};
