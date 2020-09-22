import { vec3 } from "gl-matrix";
import { up } from "../../constant";
import { cross } from "../../math/convexPolygon";
import { cells } from "./cells";
import { fillIndexes, fillPoints } from "./fill";

export const triangles: {
  vertices: vec3[];
  normal: vec3;
  cellIndex: number | null;
}[] = [];

const push = (vertices: vec3[], cellIndex: number | null) => {
  const normal = cross(
    [] as any,
    vertices[1],
    vertices[0],
    vertices[2],
    vertices[0]
  );
  vec3.normalize(normal, normal);

  if (vec3.dot(normal, up) < 0) {
    vertices.reverse();
    vec3.scale(normal, normal, -1);
  }

  triangles.push({ vertices, normal, cellIndex });
};

for (let i = cells.length; i--; )
  for (let j = cells[i].length - 1; j--; )
    push([cells[i][0], cells[i][j], cells[i][j + 1]], i);

for (const indexes of fillIndexes)
  push(
    indexes.map((k) => fillPoints[k]),
    null
  );
