import { lerp } from "./utils";

const fade = (x: number) => 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;

export const generatePerlinNoise = (
  width: number,
  height: number,
  radius: number
) => {
  const w = Math.ceil(width / radius) + 1;
  const h = Math.ceil(height / radius) + 1;

  const grid = Array.from({ length: w * h }).map(() => {
    const angle = Math.random() * Math.PI * 2;

    return [Math.cos(angle), Math.sin(angle)];
  });

  return (x: number, y: number) => {
    const xr = x / radius;
    const yr = y / radius;
    const gx = Math.floor(xr);
    const gy = Math.floor(yr);
    const sx = xr - gx;
    const sy = yr - gy;

    const ps = [
      //
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ].map(([ax, ay]) => {
      const [ux, uy] = grid[(gx + ax) * h + (gy + ay)];

      return ux * (gx + ax - xr) + uy * (gy + ay - yr);
    });

    return lerp(
      //
      fade(sy),
      lerp(fade(sx), ps[0], ps[1]),
      lerp(fade(sx), ps[2], ps[3])
    );
  };
};
