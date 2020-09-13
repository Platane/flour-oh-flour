import { generatePerlinNoise } from "../../math/generatePerlinNoise";
import { vec2, vec3, mat4 } from "gl-matrix";
import { getDelaunayTriangulation } from "../../math/getDelaunayTriangulation";
import {
  flourBags as logicFlourBags,
  date,
  cells as logicCells,
  maxGrowth,
} from "../../logic";
import { epsilon, tmp1, tmp2, up, z, x, down } from "../../constant";
import { createField } from "../geometries/field";
import {
  n as staticN,
  vertices as staticVertices,
  pushFace as pushFaceStatic,
  pushFlatFace as pushFlatFaceStatic,
} from "../globalBuffers/static";
import {
  pushFlatFace as pushFlatFaceDynamic,
  vertices,
} from "../globalBuffers/dynamic";
import { getVoronoiTesselation } from "../../math/getVoronoiTesselation";
import {
  getPolygonArea,
  getPolygonBoundingSphereRadius,
  getPolygonCenter,
  isInsidePolygon,
  enlargePolygon,
  cross,
} from "../../math/convexPolygon";
import { getSegmentIntersection } from "../../math/getSegmentIntersection";
import { hillColor, dirtColor } from "../colors";
import { createWindmill } from "../geometries/windmill";
import { createFlourBag, bagSize } from "../geometries/flourBag";
import { raycastFromScreen, raycast } from "../raycast";

//
// constant
//
const cellN = 8;
const cellCloudN = 60;
const triangleCloudN = 800;
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
const potatoCenter: vec2 = getPolygonCenter(
  [] as any,
  potatoPoints as any
) as any;

const insideUnitSquare = (x: number, y: number) =>
  x >= 0 && x < 1 && y >= 0 && y < 1;

const distanceToPotato = (x: number, y: number) => {
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

  const d = distanceToPotato(x, y);

  return (0.7 * d + h * d) * 0.3;
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
      (v) =>
        !insideUnitSquare(v[0], v[1]) || distanceToPotato(v[0], v[1]) < 0.14
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
for (let i = fillIndexes.length; i--; ) {
  const c = getPolygonCenter(
    tmp1,
    fillIndexes[i].map((k) => fillPoints[k])
  );

  if (!isInsidePotato(c[0], c[1])) fillIndexes.splice(i, 1);
}

//
// add cliff
//
for (let i = fillIndexes.length; i--; )
  for (let u = 3; u--; ) {
    const a = fillIndexes[i][u];
    const b = fillIndexes[i][(u + 1) % 3];

    let l = 0;

    for (let j = fillIndexes.length; j--; )
      for (let v = 3; v--; ) {
        const c = fillIndexes[j][v];
        const d = fillIndexes[j][(v + 1) % 3];

        if ((a === c && b === d) || (a === d && b === c)) l++;
      }

    if (l === 1) {
      let k = fillPoints.length;

      fillPoints.push(
        ...[fillPoints[a], fillPoints[b]]
          .map((x) => {
            const p = [
              x[0] - potatoCenter[0],
              x[1] - potatoCenter[1],
              0,
            ] as vec3;

            vec3.normalize(p, p);
            p[2] = -5;

            vec3.normalize(p, p);
            vec3.scale(p, p, 0.1);

            vec3.add(p, p, x);

            return p;
          })
          .reverse()
      );

      fillIndexes.push([a, b, k], [a, k + 1, k]);
    }
  }

//
// form the triangles
//

// currently only the cells are activatable,
// the active face points to the index of the face
export const activeFaces: number[] = [];

const updates: (() => void)[] = [];

// const transform = mat4.create();
const transform = mat4.create();
mat4.multiply(transform, transform, mat4.fromScaling([] as any, [2, -1, 2]));
mat4.multiply(
  transform,
  transform,
  mat4.fromTranslation([] as any, [-potatoCenter[0], 0, -potatoCenter[1]])
);
mat4.multiply(transform, transform, mat4.fromXRotation([] as any, Math.PI / 2));

for (const cell of cells) {
  const vertices = cell.map((v) => vec3.transformMat4([] as any, v, transform));

  const nn = cross(
    [] as any,
    vertices[1],
    vertices[0],
    vertices[2],
    vertices[0]
  );
  if (nn[1] < 0) {
    vertices.reverse();
    vec3.scale(nn, nn, -1);
  }

  vec3.normalize(nn, nn);

  let a = staticN;
  pushFaceStatic(vertices, dirtColor, nn);

  const i = logicCells.length;
  logicCells.push({
    growth: maxGrowth * 0.9,
    area: getPolygonArea(vertices),
    type: "growing",
  } as any);

  updates.push(createField(vertices, i));

  for (let j = a; j < staticN; j++) activeFaces[j] = i;
}

for (const indexes of fillIndexes) {
  const vertices = indexes.map((k) =>
    vec3.transformMat4([] as any, fillPoints[k], transform)
  );

  // ensure that the faces are pointed to the up axis
  const nn = cross(
    [] as any,
    vertices[1],
    vertices[0],
    vertices[2],
    vertices[0]
  );
  if (nn[1] < 0) {
    vertices.reverse();
    vec3.scale(nn, nn, -1);
  }

  vec3.normalize(nn, nn);

  pushFaceStatic(vertices, hillColor, nn);
}

export const fieldsN = staticN;

//
// add windmills
//
const windMillCenterX = Math.random() * 0.6 + 0.2;
const windMillCenterY = Math.random() * 0.6 + 0.2;
const windmillPositions: vec3[] = [];
let r = 0.1;
while (r < 0.4 && windmillPositions.length < 100) {
  const x = Math.random();
  const y = Math.random();

  const p: vec3 = [x, y, 0];

  r *= 1.02;

  if (
    Math.hypot(windMillCenterX - x, windMillCenterY - y) < r &&
    isInsidePotato(x, y) &&
    distanceToPotato(x, y) > 0.14 &&
    !flatEnlargedCells.some((cell) => isInsidePolygon(cell, z, [x, y, 0])) &&
    windmillPositions.every((p0) => vec2.distance(p as any, p0 as any) > 0.012)
  ) {
    const z = getAltitude(x, y);

    const s = 0.018;

    let d = 0;
    for (let k = 5; k--; ) {
      const sx = x + 0.5 * s * Math.sin((k / 5) * Math.PI * 2);
      const sy = y + 0.5 * s * Math.cos((k / 5) * Math.PI * 2);

      d = Math.max(d, getAltitude(sx, sy) - z);
    }

    windmillPositions.push(p.slice() as any);

    p[0] = (p[0] - potatoCenter[0]) * 2;
    p[2] = (p[1] - potatoCenter[1]) * 2;
    p[1] = z + d;

    const tr = mat4.create();
    mat4.multiply(tr, tr, mat4.fromTranslation([] as any, p as any));
    mat4.multiply(tr, tr, mat4.fromScaling([] as any, [s, s, s]));
    mat4.multiply(
      tr,
      tr,
      mat4.fromYRotation([] as any, Math.random() * Math.PI * 2)
    );

    updates.push(createWindmill(tr));

    k = 0;
  }
}

//
// define flour stack
//
let flourStackX = 0.00001;
let flourStackY = 0.00001;

while (
  !isInsidePotato(flourStackX, flourStackY) ||
  distanceToPotato(flourStackX, flourStackY) < 0.14 ||
  cells.some((cell) => isInsidePolygon(cell, z, [flourStackX, flourStackY, 0]))
) {
  flourStackX = Math.random() * 0.6 + 0.2;
  flourStackY = Math.random() * 0.6 + 0.2;
}

const getFlourStackPosition = () => {
  let r = 0.02;

  for (let k = 150; k--; ) {
    const x = flourStackX + (Math.random() - 0.5) * 2 * r;
    const y = flourStackY + (Math.random() - 0.5) * 2 * r;

    const p: vec3 = [x, y, 0];

    if (
      insideUnitSquare(x, y) &&
      Math.hypot(flourStackX - x, flourStackY - y) < r &&
      isInsidePotato(x, y) &&
      distanceToPotato(x, y) > 0.14 &&
      !cells.some((cell) => isInsidePolygon(cell, z, [x, y, 0])) &&
      windmillPositions.every(
        (p0) => vec2.distance(p as any, p0 as any) > 0.001
      )
    ) {
      p[0] = (p[0] - potatoCenter[0]) * 2;
      p[2] = (p[1] - potatoCenter[1]) * 2;
      p[1] = 5;

      const u = raycast(p, down, staticVertices as any, fieldsN);

      p[1] = u!.p[1];

      return p;
    }

    r = r + 0.012;
  }

  return [0, -10, 0] as vec3;
};

const stack: vec3[] = [];

const flourBags: {
  a: vec3;
  b: vec3;
  c: vec3;
  angle: number;
  date0: number;
  duration: number;
}[] = [];

const flourTransform: mat4 = [] as any;

// for (let k = 300; k--; ) logicFlourBags.push(0);

// setInterval(() => {
//   for (let k = 10; k--; ) logicFlourBags.push(0);
// }, 450);

updates.push(() => {
  while (logicFlourBags[stack.length] !== undefined) {
    const cellIndex = logicFlourBags[stack.length];

    const cell = cells[cellIndex];

    const a = getPolygonCenter([] as any, cell);
    vec3.transformMat4(a, a, transform);
    a[1] += bagSize;

    const b = getFlourStackPosition();
    b[1] += bagSize / 2;

    for (const p of stack) {
      const l = vec2.distance(b as any, p as any);

      if (l < bagSize * 0.32) {
        vec3.copy(b, p);
        b[1] += bagSize * 1.03;
      }
    }

    const c: vec3 = [(a[0] + b[0]) / 2, 1.2, (a[2] + b[2]) / 2];

    stack.push(b);

    flourBags.push({
      a,
      b,
      c,
      angle: Math.random() * Math.PI * 2,
      date0: date,
      duration: (vec3.distance(a, c) + vec3.distance(c, b)) / 3,
    });
  }

  for (let i = flourBags.length; i--; ) {
    const { a, b, c, date0, duration } = flourBags[i];

    const k = Math.min((date - date0) / duration, 1);

    const p: vec3 = [
      //
      a[0] * (1 - k) * (1 - k) + c[0] * (1 - k) * k + b[0] * k * k,
      a[1] * (1 - k) * (1 - k) + c[1] * (1 - k) * k + b[1] * k * k,
      a[2] * (1 - k) * (1 - k) + c[2] * (1 - k) * k + b[2] * k * k,
    ];

    mat4.fromTranslation(flourTransform, p);

    if (k === 1) {
      flourBags.splice(i, 1);
      createFlourBag(flourTransform, pushFlatFaceStatic);
    } else {
      createFlourBag(flourTransform, pushFlatFaceDynamic);
    }
  }
});

export const update = () => {
  for (const update of updates) update();
};
