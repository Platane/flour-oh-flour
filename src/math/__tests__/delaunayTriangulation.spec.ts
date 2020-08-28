import { delaunayTriangulation } from "../delaunayTriangulation";
import { vec2 } from "gl-matrix";

it("should triangulate zero points", () => {
  expect(delaunayTriangulation([])).toEqual([]);
});

it("should triangulate 1 points", () => {
  expect(delaunayTriangulation([[0, 0]])).toEqual([]);
});

it("should triangulate 3 points", () => {
  expect(
    delaunayTriangulation([
      [0, 0],
      [0, 1],
      [1, 0],
    ])
  ).toEqual([[2, 1, 0]]);
});

it("should triangulate 5 points", () => {
  expect(
    delaunayTriangulation([
      [0, 0],
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]).length
  ).toEqual(4);
});
