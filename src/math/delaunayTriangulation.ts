import { vec2 } from "gl-matrix";

const epsilon = 1e-6;

export const getCircumCenter = (A: vec2, B: vec2, C: vec2): vec2 | null => {
  // define m1 as middle of AB
  // define m2 as middle of AC
  // define n1 as vector perpendicular of AB
  // define n2 as vector perpendicular of AC
  // the center of the circum circle is at the intersection of those two line

  const m1x = (A[0] + B[0]) / 2;
  const m1y = (A[1] + B[1]) / 2;

  const n1x = -(A[1] - B[1]);
  const n1y = A[0] - B[0];

  const m2x = (A[0] + C[0]) / 2;
  const m2y = (A[1] + C[1]) / 2;

  const n2x = -(A[1] - C[1]);
  const n2y = A[0] - C[0];

  // colinear
  if (Math.abs(n1x * n2y - n1y * n2x) < epsilon) {
    return null;

    // uncomment to return any point of the line if the line are the same line

    //           m2
    // __________+_________ n1
    //         / |
    //  m1  /    | h
    // __+_______|_________ n2
    //
    // return any point

    // const m1m2x = m2x - m1x;
    // const m1m2y = m2y - m1y;

    // const h = n1x * m1m2x + n1y * m1m2y;

    // if (Math.abs(h) < epsilon) return [m1x, m1y];
    // // lines never cross
    // else return null;
  }

  // m1 + n1 * k1  =  m2 + n2 * k2

  // | m1x | + | n1x |           | m2x | + | n2x |
  // |     | + |     | * k1   =  |     | + |     | * k2
  // | m1y | + | n1y |           | m2y | + | n2y |

  // n2 *  k2 = m1 - m2 + n1 * k1

  let k1;
  if (Math.abs(n2x) < epsilon) k1 = (m2x - m1x) / n1x;
  else if (Math.abs(n2y) < epsilon) k1 = (m2y - m1y) / n1y;
  else k1 = ((m1x - m2x) / n2x - (m1y - m2y) / n2y) / (n1y / n2y - n1x / n2x);

  return [m1x + n1x * k1, m1y + n1y * k1] as vec2;
};

export const getCircumCircle = (A: vec2, B: vec2, C: vec2) => {
  const center = getCircumCenter(A, B, C)!;
  if (!center) return null;
  return { center, radiusSquared: vec2.squaredDistance(center, A) };
};

// a triangle that contains all the points
// may not be the smallest triangle
const computeBoundingTriangle = (points: vec2[]): vec2[] => {
  // compute the bounding box
  const maxX = Math.max(0, ...points.map((p) => p[0])) + 1;
  const maxY = Math.max(0, ...points.map((p) => p[1])) + 1;
  const minX = Math.min(0, ...points.map((p) => p[0])) - 1;
  const minY = Math.min(0, ...points.map((p) => p[1])) - 1;

  // compute this triangle ( which indeed contains the bounding box )
  //
  //   B
  //   |\
  //   |   \
  //   |_ _ _ \
  //   |       | \
  //   |       |    \
  //   |_ _ _ _| _ _ _ \
  //   A                 C

  return [
    [minX, minY],
    [minX, maxY + (maxY - minY)],
    [maxX + (maxX - minX), minY],
  ];
};

export const delaunayTriangulation = (points: vec2[]) => {
  // determine a triangle which contains all the points as starting triangle
  // then add points one by one

  const n = points.length;

  const boundingTriangle = computeBoundingTriangle(points);
  points.push(...boundingTriangle);

  const triangles = [
    {
      indices: [n + 2, n + 1, n + 0] as [number, number, number],
      circle: getCircumCircle(
        boundingTriangle[0],
        boundingTriangle[1],
        boundingTriangle[2]
      )!,
    },
  ];

  // iterate through the points
  // add them one by one to the structure
  for (let i = n; i--; ) {
    const edges: [number, number][] = [];

    for (let j = triangles.length; j--; ) {
      const {
        circle: { center, radiusSquared },
        indices: [A, B, C],
      } = triangles[j];

      if (vec2.squaredDistance(center, points[i]) < radiusSquared) {
        triangles.splice(j, 1);

        edges.push([A, B], [A, C], [B, C]);
      }
    }

    edges.forEach(([a, b]) => {
      const n = edges.filter(([a1, b1]) => a === a1 && b === b1).length;

      if (n === 1) {
        triangles.push({
          indices: [a, b, i],
          circle: getCircumCircle(points[a], points[b], points[i])!,
        });
      }
    });
  }

  return triangles
    .filter(({ indices }) => !indices.some((x) => x >= n))
    .map(({ indices }) => indices);
};
