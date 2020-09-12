import { getSegmentIntersection } from "../getSegmentIntersection";
import { vec2 } from "gl-matrix";

it("should get intersection", () => {
  const a: [vec2, vec2, vec2, vec2] = [
    //
    [1, 0],
    [-1, 0],
    [0.5, -1],
    [0.5, 9],
  ];

  const out = getSegmentIntersection(...a);
  expect(out?.slice(0, 2)).toEqual([0.5, 0]);
});

it("should get intersection", () => {
  const a: [vec2, vec2, vec2, vec2] = [
    //
    [1, 0],
    [-1, 0],
    [1, -1],
    [0, 1],
  ];

  const out = getSegmentIntersection(...a);
  expect(out?.slice(0, 2)).toEqual([0.5, 0]);
});

it("should get intersection", () => {
  const a: [vec2, vec2, vec2, vec2] = [
    //
    [1, 0],
    [-1, 0],
    [2, -1],
    [2, 1],
  ];

  const out = getSegmentIntersection(...a);
  expect(out).toEqual(null);
});

it("should get intersection", () => {
  const a: [vec2, vec2, vec2, vec2] = [
    //
    [2, -1],
    [2, 1],
    [1, 0],
    [-1, 0],
  ];

  const out = getSegmentIntersection(...a);
  expect(out).toEqual(null);
});
