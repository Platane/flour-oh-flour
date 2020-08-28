import { lerp } from "./math/utils";

const fade = (x: number) =>
  6 * x * x * x * x * x - 15 * x * x * x * x + 10 * x * x * x;

export const generatePerlinNoise = (
  width: number,
  height: number,
  radius: number
) => {
  const w = Math.ceil(width / radius) + 1;
  const h = Math.ceil(height / radius) + 1;

  const grid = Array.from({ length: w * h }).map(() => {
    const angle = Math.random() * Math.PI * 2;

    return { x: Math.cos(angle), y: Math.sin(angle) };
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
      { x: 0, y: 0 },
      { x: 1, y: 0 },

      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ].map((a) => {
      const u = grid[(gx + a.x) * h + (gy + a.y)];

      return u.x * (gx + a.x - xr) + u.y * (gy + a.y - yr);
    });

    return lerp(
      //
      fade(sy),
      lerp(fade(sx), ps[0], ps[1]),
      lerp(fade(sx), ps[2], ps[3])
    );
  };
};
