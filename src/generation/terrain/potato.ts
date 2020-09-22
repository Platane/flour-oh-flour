import { generatePerlinNoise } from "../../math/generatePerlinNoise";

//
// generate an interesting potato shaped hull
//
const gauss = (cx: number, cy: number, tau: number, x: number, y: number) => {
  var d = Math.hypot(cx - x, cy - y) / (tau * tau);

  return Math.exp(-0.5 * d);
};

const potatoPerlin = generatePerlinNoise(3, 3, 0.35);

export const potatoBlobs = Array.from({ length: 7 }, () => [
  (Math.random() - 0.5) * 2 * 0.56,
  (Math.random() - 0.5) * 2 * 0.56,

  (1 + Math.random()) * 0.2,
]);

export const getH = (x: number, y: number) => {
  const g = potatoBlobs.reduce(
    (sum, [cx, cy, tau]) => sum + gauss(cx, cy, tau, x, y),
    0
  );
  const p = potatoPerlin(x + 1.5, y + 1.5) * 1.7;

  const d = 1 - Math.min(1, Math.hypot(x, y));

  return g + p * (0.1 + d * 0.4);
};

export const isInsideRawPotato = (x: number, y: number) => getH(x, y) > 0.5;

//
// approximate potato shape
//

let maxX = -1;
let maxY = -1;
let minX = 1;
let minY = 1;
for (const [x, y] of potatoBlobs) {
  maxX = Math.max(maxX, x + 0.04);
  minX = Math.min(minX, x - 0.04);
  maxY = Math.max(maxY, y + 0.04);
  minY = Math.min(minY, y - 0.04);
}

const rand = (a: number, b: number) => Math.random() * (b - a) + a;

for (let k = 60; k--; ) {
  const x0 = rand(minX, maxX);

  {
    const y = rand(-1, minY);
    if (isInsideRawPotato(x0, y)) minY = y;
  }

  {
    const y = rand(maxY, 1);
    if (isInsideRawPotato(x0, y)) maxY = y;
  }

  const y0 = rand(minY, maxY);
  {
    const x = rand(-1, minX);
    if (isInsideRawPotato(x, y0)) minX = x;
  }

  {
    const x = rand(maxX, 1);
    if (isInsideRawPotato(x, y0)) maxX = x;
  }
}

// for (let k = 500; k--; ) {
//   const x = (Math.random() - 0.5) * 2;
//   const y = (Math.random() - 0.5) * 2;

//   if (isInsideRawPotato(x, y)) {
//     maxX = Math.max(maxX, x);
//     minX = Math.min(minX, x);
//     maxY = Math.max(maxY, y);
//     minY = Math.min(minY, y);
//   }
// }

const cx = (maxX + minX) / 2;
const cy = (maxY + minY) / 2;

const m = 0.1;
const r = Math.min(1, Math.max(maxX - minX + m, maxY - minY + m) / 2);

export const isInsidePotato = (x: number, y: number) =>
  isInsideRawPotato((x + cx) * r, (y + cy) * r);
