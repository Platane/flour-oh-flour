import { getCircumCenter } from "../delaunayTriangulation";
import { vec2 } from "gl-matrix";

test.each([
  [
    [0, 0],
    [0, 1],
    [1, 0],
  ],
  [
    [-1, 0],
    [0, 1],
    [1, 0],
  ],
  [
    [2, 5],
    [8, 6],
    [1, 5],
  ],
  [
    [20, 15],
    [18, 6],
    [1, 25],
  ],
] as vec2[][])("should compute the circum center", (A, B, C) => {
  const c1 = getCircumCenter(A, B, C);
  const c2 = getCircumCenter(B, C, A);
  const c3 = getCircumCenter(C, A, B);

  expect(vec2.equals(c1!, c2!)).toBe(true);
  expect(vec2.equals(c1!, c3!)).toBe(true);

  const la = vec2.distance(c1!, A);
  const lb = vec2.distance(c1!, B);
  const lc = vec2.distance(c1!, C);

  expect(la).toBeCloseTo(lb);
  expect(la).toBeCloseTo(lc);
});

it("should return null with degenerated triangle", () => {
  expect(getCircumCenter([1, 2], [-2, -4], [3, 6])).toBe(null);
});
