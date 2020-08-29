import { getVoronoiTesselation } from "../getVoronoiTesselation";

it("should tesselate zero points", () => {
  expect(getVoronoiTesselation([]).faces.length).toEqual(0);
});

it("should tesselate 1 points", () => {
  expect(getVoronoiTesselation([[0, 0]]).faces.length).toEqual(0);
});

it("should tesselate 5 points", () => {
  expect(
    getVoronoiTesselation([
      [0, 0],
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]).faces.length
  ).toEqual(1);
});
