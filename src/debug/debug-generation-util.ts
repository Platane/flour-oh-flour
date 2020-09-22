import { vec2 } from "gl-matrix";
import { isInsidePotato } from "../generation/terrain/potato";
import { debugContainer } from "./debug-util";

export const l = 300;
export const s = 2 / l;
const potatoCanvas = document.createElement("canvas");

export const pixels: [number, number][] = [];

for (let sx = l; sx--; ) for (let sy = l; sy--; ) pixels.push([sx, sy]);

export const project = (x: number, y: number) => [
  (x / l - 0.5) * 2,
  (y / l - 0.5) * 2,
];

export const pixelsProj = pixels.map(([x, y]) => project(x, y));

{
  potatoCanvas.width = l;
  potatoCanvas.height = l;

  const ctx = potatoCanvas.getContext("2d")!;

  for (const [sx, sy] of pixels) {
    const x = (sx / l - 0.5) * 2;
    const y = (sy / l - 0.5) * 2;

    ctx.fillStyle = isInsidePotato(x, y) ? `#fff` : `#880`;

    ctx.fillRect(sx, sy, 1, 1);
  }
}

export const create = (title?: string) => {
  const c = document.createElement("canvas");
  c.title = title || "";
  c.style.margin = "4px";
  c.width = l;
  c.height = l;
  debugContainer.appendChild(c);
  const ctx = c.getContext("2d")!;
  ctx.drawImage(potatoCanvas, 0, 0);
  ctx.scale(l / 2, l / 2);
  ctx.translate(1, 1);
  ctx.lineWidth = s;

  return ctx;
};

export const polygon = (ctx: CanvasRenderingContext2D, arr: vec2[]) => {
  ctx.beginPath();
  ctx.moveTo(arr[0][0], arr[0][1]);
  for (let i = arr.length; i--; ) ctx.lineTo(arr[i][0], arr[i][1]);
  ctx.closePath();
};