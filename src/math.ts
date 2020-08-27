export const lerp = (weight: number, a1: number, a2: number) =>
  (1 - weight) * a1 + weight * a2;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export type Point = { x: number; y: number };

export const length = ({ x, y }: Point) => Math.sqrt(x * x + y * y);

export const around4 = [
  //
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
  { x: -1, y: -1 },
];
