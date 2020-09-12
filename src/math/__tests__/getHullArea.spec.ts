import { getHullArea } from "../hull";
import { vec3 } from "gl-matrix";
import { zero } from "../../constant";

const square: vec3[] = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
];

const circle: vec3[] = Array.from({ length: 40 }).map((_, i, arr) => [
  Math.cos((i / arr.length) * Math.PI * 2),
  Math.sin((i / arr.length) * Math.PI * 2),
  0,
]);

it("should compute area of a square", () => {
  expect(getHullArea(square)).toBeCloseTo(1);
});
it.only("should compute area of a quasi-circle", () => {
  expect(getHullArea(circle)).toBeCloseTo(Math.PI, 1);
});

it("should compute area of a rotated square", () => {
  expect(
    getHullArea(square.map((x) => vec3.rotateY([] as any, x, zero, 543)))
  ).toBeCloseTo(1);
});
it("should compute area of a rotated circle", () => {
  expect(
    getHullArea(circle.map((x) => vec3.rotateY([] as any, x, zero, 543)))
  ).toBeCloseTo(Math.PI, 1);
});
