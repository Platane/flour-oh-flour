import { generatePerlinNoise } from "../../math/generatePerlinNoise";
import { vec2, vec3, mat4 } from "gl-matrix";
import { getDelaunayTriangulation } from "../../math/getDelaunayTriangulation";
import { cells, maxGrowth } from "../../logic";
import { zero, tmp0, epsilon, tmp1, tmp2, up } from "../../constant";
import { createField } from "../geometries/field";
import {
  vertices,
  normals,
  colors,
  incrementN,
  n,
  pushFace,
} from "../globalBuffers/static";
import { getVoronoiTesselation } from "../../math/getVoronoiTesselation";
import { createCanvas } from "../../debugCanvas";
import {
  getPolygonArea,
  getPolygonBoundingSphereRadius,
  getPolygonCenter,
  isInsidePolygon,
} from "../../math/convexPolygon";
import { getSegmentIntersection } from "../../math/getSegmentIntersection";
import { hillColor, dirtColor } from "../colors";

//
// generate an interesting potato shaped hull
//
const gauss = (cx: number, cy: number, tau: number, x: number, y: number) => {
  const dx = cx - x;
  const dy = cy - y;

  var d = (dx * dx + dy * dy) / (tau * tau);

  return Math.exp(-0.5 * d);
};

const hullPerlin = generatePerlinNoise(1, 1, 0.35);

const hullBlobs = Array.from({ length: 6 }, () => [
  Math.random() * 0.46 + 0.27,
  Math.random() * 0.46 + 0.27,

  (1 + Math.random()) * 0.1,
]);

const isInsideHull = (x: number, y: number) => {
  const g = hullBlobs.reduce(
    (sum, [cx, cy, tau]) => sum + gauss(cx, cy, tau, x, y),
    0
  );
  const p = hullPerlin(x, y) * 1.7;

  const d = 0.5 - Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);

  const v = g + p * (0.4 + d * 0.6);

  return v > 0.5;
};

//
// pick random point inside the hull
//
const hullPoints: vec2[] = [];
while (hullPoints.length < 35) {
  const x = Math.random();
  const y = Math.random();

  if (isInsideHull(x, y)) hullPoints.push([x, y]);
}

//
// generate the height function
//
const hullCenter: vec2 = [0, 0];
for (let i = hullPoints.length; i--; ) {
  hullCenter[0] += hullPoints[i][0] / hullPoints.length;
  hullCenter[1] += hullPoints[i][1] / hullPoints.length;
}

const insideUnitSquare = (x: number, y: number) =>
  x >= 0 && x < 1 && y >= 0 && y < 1;

const distanceToHull = (x: number, y: number) => {
  const v = vec2.set([] as any, x, y);
  vec2.sub(v, v, hullCenter);
  vec2.normalize(v, v);

  let minD = Infinity;

  const L = 0.15;

  for (let k = 26; k--; ) {
    const i = epsilon + Math.random() * L;
    const j = i * (Math.random() - 0.5) * 0.7;

    const px = x + i * v[0] + j * v[1];
    const py = y + i * v[1] - j * v[0];

    const d = i * i + j * j;
    if (d < minD && (!insideUnitSquare(px, py) || !isInsideHull(px, py)))
      minD = d;
  }

  return Math.min(1, Math.sqrt(minD) / L);
};

const altitudePerlin0 = generatePerlinNoise(3, 3, 0.14);
const altitudePerlin1 = generatePerlinNoise(3, 3, 0.32);
const altitudePerlin2 = generatePerlinNoise(3, 3, 0.73);

const getAltitude = (x: number, y: number) => {
  let h = -0.3;
  h += altitudePerlin0(x + 1.2, y + 1.16) * 0.5;
  h += altitudePerlin1(x + 1.7, y + 1.6) * 0.6;
  h += altitudePerlin2(x + 1.57, y + 1.2) * 0.8;

  const d = distanceToHull(x, y);

  return (0.7 * d + h * d) * 0.1;
};

//
// pick some cells
//

const cellCandidates = getVoronoiTesselation(hullPoints);
const cellCandidatesVertices = cellCandidates.vertices.map(
  ([x, y]: any) =>
    [x, insideUnitSquare(x, y) ? getAltitude(x, y) : 0, y] as vec3
);
const frozenVertices: boolean[] = [];

const ccells: vec3[][] = [];

const nCell = 8;

while (cellCandidates.faces.length && ccells.length < nCell) {
  const k = Math.floor(Math.random() * cellCandidates.faces.length);
  const [indexes] = cellCandidates.faces.splice(k, 1);

  const vertices = indexes.map((i) => cellCandidatesVertices[i]);

  // if some point is outside the hull
  // ignore
  if (
    vertices.some(
      (v) => !insideUnitSquare(v[0], v[2]) || distanceToHull(v[0], v[2]) < 0.14
    )
  )
    continue;

  // if the shape is not pretty enough
  // ignore

  const boundingSphereArea =
    getPolygonBoundingSphereRadius(vertices) ** 2 * Math.PI;

  const hullArea = getPolygonArea(vertices);
  const hullCompactness = hullArea / boundingSphereArea;

  if (hullArea < 0.01 || hullCompactness < 0.4) continue;

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

  // move the vertices inside the plan
  // and flag then as frozen
  for (const i of indexes) {
    if (!anchors.includes(i)) {
      const d = vec3.dot(
        n,
        vec3.sub(
          tmp1,
          cellCandidatesVertices[i],
          cellCandidatesVertices[anchors[0]]
        )
      );

      vec3.scaleAndAdd(
        cellCandidatesVertices[i],
        cellCandidatesVertices[i],
        n,
        -d
      );

      frozenVertices[i] = true;
    }
  }

  // ensure that the faces are pointed to the up axis
  const nn = vec3.cross(
    [] as any,
    vec3.sub(tmp1, vertices[1], vertices[0]),
    vec3.sub(tmp2, vertices[2], vertices[0])
  );
  if (nn[1] < 0) vertices.reverse();

  // add to the cell list
  ccells.push(vertices);
}

//
// get another point cloud to fill the void between cells
//

const fillPoints: vec2[] = ccells
  .flat(1)
  .filter((x, i, arr) => i === arr.indexOf(x))
  .map(([x, y, z]: any) => [x, z, y] as any);

const fillPointsSplit: vec2[] = [];

let k = 0;
while (k < 100 && fillPoints.length < 160) {
  const x = Math.random();
  const y = Math.random();

  const p: vec2 = [x, y];

  if (
    isInsideHull(x, y) &&
    !ccells.some((cell) => isInsidePolygon(cell, up, [x, 0, y])) &&
    fillPoints.every((p0) => vec2.squaredDistance(p, p0) > 0.0005)
  ) {
    k = 0;
    fillPoints.push(p);
  } else {
    k++;
  }
}

const fillIndexes = getDelaunayTriangulation(fillPoints);

//
// split the triangle edge on cell edge
//

const cellEdges: [vec3, vec3][] = [];
for (const cell of ccells)
  for (let u = cell.length; u--; ) {
    const A = cell[u];
    const B = cell[(u + 1) % cell.length];

    if (
      !cellEdges.some(([a, b]) => (a === A && b === B) || (b === A && a === B))
    )
      cellEdges.push([A, B]);
  }

for (const edge of cellEdges) {
  edge[0] = [edge[0][0], edge[0][2], edge[0][1]];
  edge[1] = [edge[1][0], edge[1][2], edge[1][1]];
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
        const out = getSegmentIntersection(B1 as vec2, B2 as vec2, A1, A2);

        if (
          out &&
          out[2] > epsilon &&
          1 - out[2] > epsilon &&
          out[3] > epsilon &&
          1 - out[3] > epsilon
        ) {
          const E = vec3.lerp([] as any, B1, B2, out[2]);

          const e = fillPoints.length;
          fillPoints.push(E as any);
          fillPointsSplit.push(E as any);

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

  if (ccells.some((cell) => isInsidePolygon(cell, up, [c[0], 0, c[1]])))
    fillIndexes.splice(i, 1);
}

//
// remove ugly outer shell
//
// TODO
for (let i = fillIndexes.length; i--; ) {}

//
// form the triangles
//

for (const p of fillPoints)
  if (p.length === 2) (p as any).push(getAltitude(p[0], p[1]));

if (process.env.NODE_ENV !== "production") {
  const l = 300;
  if (false) {
    const c = createCanvas();
    const ctx = c.getContext("2d")!;

    for (let sx = l; sx--; )
      for (let sy = l; sy--; ) {
        const x = sx / l;
        const y = sy / l;

        ctx.fillStyle = `#a00`;
        if (isInsideHull(x, y)) {
          const distance = distanceToHull(x, y);

          ctx.fillStyle = `hsl(${distance * 120},80%,80%)`;
          ctx.fillStyle = `hsl(${distance * 120},0%,${distance * 100}%)`;
        }

        ctx.fillRect(sx, sy, 1, 1);
      }
  }
  {
    const c = createCanvas();
    // c.style.left = 5 + l + "px";
    const ctx = c.getContext("2d")!;

    for (let sx = l; sx--; )
      for (let sy = l; sy--; ) {
        const x = sx / l;
        const y = sy / l;

        ctx.fillStyle = `#a00`;
        if (isInsideHull(x, y)) {
          // const a = getAltitude(x, y);

          ctx.fillStyle = `#fff`;
          // ctx.fillStyle = `hsl(${a * 320},80%,80%)`;
          // ctx.fillStyle = `hsl(${a * 120},0%,${a * 300}%)`;
        }

        ctx.fillRect(sx, sy, 1, 1);
      }

    // ctx.lineWidth = 0.5;
    // ctx.fillStyle = `#ab3`;
    // for (const cell of ccells) {
    //   ctx.fillStyle = `hsl(${Math.random() * 80 + 280},100%,80%)`;

    //   ctx.beginPath();
    //   ctx.moveTo(cell[0][0] * l, cell[0][2] * l);
    //   for (let i = cell.length; i--; )
    //     ctx.lineTo(cell[i][0] * l, cell[i][2] * l);
    //   ctx.fill();
    //   ctx.stroke();
    // }

    ctx.fillStyle = `#23e`;
    for (const p of fillPoints) {
      const r = 2;
      ctx.beginPath();
      ctx.fillRect(p[0] * l - r / 2, p[1] * l - r / 2, r, r);
    }

    for (const p of fillPointsSplit) {
      const r = 6;
      ctx.beginPath();
      ctx.fillRect(p[0] * l - r / 2, p[1] * l - r / 2, r, r);
    }

    ctx.lineWidth = 0.25;
    for (const [a, b, c] of fillIndexes) {
      ctx.beginPath();
      ctx.fillStyle = `hsla(${Math.random() * 100 + 100},100%,80%,0.35)`;
      ctx.moveTo(fillPoints[a][0] * l, fillPoints[a][1] * l);
      ctx.lineTo(fillPoints[b][0] * l, fillPoints[b][1] * l);
      ctx.lineTo(fillPoints[c][0] * l, fillPoints[c][1] * l);
      ctx.lineTo(fillPoints[a][0] * l, fillPoints[a][1] * l);
      ctx.fill();
    }
    for (const [a, b, c] of fillIndexes) {
      ctx.beginPath();
      ctx.moveTo(fillPoints[a][0] * l, fillPoints[a][1] * l);
      ctx.lineTo(fillPoints[b][0] * l, fillPoints[b][1] * l);
      ctx.lineTo(fillPoints[c][0] * l, fillPoints[c][1] * l);
      ctx.lineTo(fillPoints[a][0] * l, fillPoints[a][1] * l);
      ctx.stroke();
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#513";
    for (const [a, b] of cellEdges) {
      ctx.beginPath();
      ctx.moveTo(a[0] * l, a[1] * l);
      ctx.lineTo(b[0] * l, b[1] * l);
      ctx.stroke();
    }
    // for (const indexes of cellCandidates.faces) {
    //   ctx.beginPath();
    //   ctx.moveTo(
    //     cellCandidates.vertices[indexes[0]][0] * l,
    //     cellCandidates.vertices[indexes[0]][1] * l
    //   );
    //   for (let i = indexes.length; i--; )
    //     ctx.lineTo(
    //       cellCandidates.vertices[indexes[i]][0] * l,
    //       cellCandidates.vertices[indexes[i]][1] * l
    //     );
    //   ctx.stroke();
    // }
  }
}

// currently only the cells are activatable,
// the active face points to the index of the face
export const activeFaces: number[] = [];

const fieldsUpdates: (() => void)[] = [];

// const transform = mat4.create();
const transform = [] as any;

mat4.multiply(transform, transform, mat4.fromScaling([] as any, [2, 1, 2]));
mat4.fromTranslation(transform, [-0.5, 0, -0.5]);

// mat4.fromScaling([] as any, 2);

for (const cell of ccells) {
  const vertices = cell.map((v) => vec3.transformMat4([] as any, v, transform));

  const nn = vec3.cross(
    [] as any,
    vec3.sub(tmp1, vertices[1], vertices[0]),
    vec3.sub(tmp2, vertices[2], vertices[0])
  );
  if (nn[1] < 0) vertices.reverse();

  vec3.normalize(nn, nn);

  let a = n;
  pushFace(vertices, [Math.random(), Math.random(), Math.random()], nn);

  const i = cells.length;
  cells.push({
    growth: maxGrowth * 0.9,
    area: getPolygonArea(vertices),
    type: "growing",
  } as any);

  fieldsUpdates.push(createField(vertices, up, i));

  for (let j = a; j < n; j++) activeFaces[j] = i;
}

for (const indexes of fillIndexes) {
  const vertices: vec3[] = indexes.map((k) => {
    const [x, z, y] = fillPoints[k] as any;
    const p: vec3 = [x, y, z];
    return vec3.transformMat4(p, p, transform);
  });

  // ensure that the faces are pointed to the up axis
  const nn = vec3.cross(
    [] as any,
    vec3.sub(tmp1, vertices[1], vertices[0]),
    vec3.sub(tmp2, vertices[2], vertices[0])
  );
  if (nn[1] < 0) vertices.reverse();

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
