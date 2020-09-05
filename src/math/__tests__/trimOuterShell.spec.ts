import { trimOuterShell } from "../trimOuterShell";

it("should trimOuterShell or triangle", () => {
  expect(trimOuterShell([[0, 1, 2, 3]])).toEqual([]);
});
