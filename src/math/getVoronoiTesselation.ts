import { getDelaunayTriangulationAndCircle } from "./getDelaunayTriangulation";
import { vec2 } from "gl-matrix";

export const getVoronoiTesselation = (points: vec2[]) => {
  const triangles = getDelaunayTriangulationAndCircle(points);

  const faces: number[][] = [];

  for (let i = points.length; i--; ) {
    const ts = [];
    for (let j = triangles.length; j--; j)
      if (triangles[j].indexes.includes(i)) ts.push(j);

    if (ts.length === 0) break;

    const k = ts.shift()!;
    const hull = [k];
    let a: number;
    let b: number;

    for (let j = 3; j--; )
      if (triangles[k].indexes[j] === i) {
        a = triangles[k].indexes[(j + 1) % 3];
        b = triangles[k].indexes[(j + 2) % 3];
      }

    while (true) {
      const j = ts.findIndex((k) => triangles[k].indexes.includes(a));

      if (j === -1) break;

      const k = ts.splice(j, 1)[0];
      hull.push(k);

      for (const u of triangles[k].indexes)
        if (u !== a! && u !== i) {
          a = u;
          break;
        }

      if (b! === a!) {
        faces.push(hull);
        break;
      }
    }
  }

  return { faces, vertices: triangles.map(({ circle }) => circle.center) };
};
