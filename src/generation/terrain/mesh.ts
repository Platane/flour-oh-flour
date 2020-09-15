import { vec3 } from "gl-matrix";
import { up } from "../../constant";
import { cells } from "./cells";
import { fillIndexes, fillPoints } from "./fill";

export const triangles: {
  vertices: vec3[];

  // edges[i] is either vertices[i+1] - vertices[i]  or  vertices[i] - vertices[i-1]
  edges: vec3[];

  normal: vec3;
  cellIndex: number | null;
}[] = [];

const push = (vertices: vec3[], cellIndex: number | null) => {
  const edges = vertices.map((_, i, arr) =>
    vec3.sub([] as any, arr[i], arr[(i + 1) % 3])
  );

  const normal = vec3.cross([] as any, edges[0], edges[1]);
  vec3.normalize(normal, normal);

  if (vec3.dot(normal, up) < 0) {
    vertices.reverse();
    edges.reverse();
  }

  triangles.push({ vertices, edges, normal, cellIndex });
};

for (let i = cells.length; i--; )
  for (let j = cells[i].length - 1; j--; )
    push([cells[i][0], cells[i][j], cells[i][j + 1]], i);

for (const indexes of fillIndexes)
  push(
    indexes.map((k) => fillPoints[k]),
    null
  );
