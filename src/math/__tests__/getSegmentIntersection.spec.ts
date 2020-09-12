import { getSegmentIntersection } from "../getSegmentIntersection";

it("should get intersection", () => {
  expect(
    getSegmentIntersection([1, 0], [-1, 0], [0.5, -1], [0.5, 9])
  ).toBeCloseTo(0.25);
});
