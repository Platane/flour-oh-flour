import { generatePerlinNoise } from "../generatePerlinNoise";

it("should generate perlin noise", () => {
  const h = generatePerlinNoise(1, 1, 0.2);

  const s = [];

  for (let k = 10000; k--; ) s.push(h(Math.random(), Math.random()));

  const m = s.reduce((sum, x) => sum + x, 0) / s.length;

  expect(m).toBeCloseTo(0, 1);
});
