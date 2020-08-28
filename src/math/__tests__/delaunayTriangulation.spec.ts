import { getDelaunayTriangulation } from "../getDelaunayTriangulation";

it("should triangulate zero points", () => {
  expect(getDelaunayTriangulation([])).toEqual([]);
});

it("should triangulate 1 points", () => {
  expect(getDelaunayTriangulation([[0, 0]])).toEqual([]);
});

it("should triangulate 3 points", () => {
  expect(
    getDelaunayTriangulation([
      [0, 0],
      [0, 1],
      [1, 0],
    ])
  ).toEqual([[2, 1, 0]]);
});

it("should triangulate 5 points", () => {
  expect(
    getDelaunayTriangulation([
      [0, 0],
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]).length
  ).toEqual(4);
});
