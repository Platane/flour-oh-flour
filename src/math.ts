export const lerp = (w: number, a1: number, a2: number) =>
  (1 - w) * a1 + w * a2;

export type Point = { x: number; y: number };

export const length = ({ x, y }: Point) => Math.sqrt(x * x + y * y);

export const around4 = [
  //
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
  { x: -1, y: -1 },
];
