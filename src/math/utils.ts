export const lerp = (weight: number, a1: number, a2: number) =>
  (1 - weight) * a1 + weight * a2;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const insideUnitSquare = (x: number, y: number) =>
  x >= -1 && x < 1 && y >= -1 && y < 1;

export const shuffle = <T>(arr: T[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};
