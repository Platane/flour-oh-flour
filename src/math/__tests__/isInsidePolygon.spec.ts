import { vec3 } from "gl-matrix";
import { zero } from "../../constant";
import { isInsidePolygon } from "../convexPolygon";

const square: vec3[] = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
];
const z: vec3 = [0, 0, 1];

it("should return true if inside the hull", () => {
  expect(isInsidePolygon(square, z, [0.3, 0.3, 0])).toBe(true);
  expect(isInsidePolygon(square, z, [0.3, 1.3, 0])).toBe(false);
});

it("should return true if on the edge of the hull", () => {
  expect(isInsidePolygon(square, z, [0, 0.5, 0])).toBe(true);
});

it("should return true if inside the hull", () => {
  expect(
    isInsidePolygon(
      square.map((x) => vec3.rotateY([] as any, x, zero, 543)),
      vec3.rotateY([] as any, z, zero, 543),
      vec3.rotateY([] as any, [0.3, 0.3, 0], zero, 543)
    )
  ).toBe(true);

  expect(
    isInsidePolygon(
      square.map((x) => vec3.rotateY([] as any, x, zero, 543)),
      vec3.rotateY([] as any, z, zero, 543),
      vec3.rotateY([] as any, [0.3, 1.3, 0], zero, 543)
    )
  ).toBe(false);
});
