import { generatePerlinNoise } from "./perlin-noise";

export const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";

// const ctx = canvas.getContext("2d")!;
// const p = generatePerlinNoise(canvas.width, canvas.height, 260);
// const l = 2;
// for (let x = 0; x < canvas.width / l; x++)
//   for (let y = 0; y < canvas.height / l; y++) {
//     const k = 0.5 + 0.5 * p((x + 0.5) * l, (y + 0.5) * l);

//     ctx.fillStyle = `hsl(${k * 320},60%,60%)`;

//     ctx.fillRect(x * l, y * l, l, l);
//   }

document.body.appendChild(canvas);

const webglOptions = {
  // alpha: true,
  // preserveDrawingBuffer: false,
  // premultipliedAlpha: false,
  stencil: true,
  antialias: true,
  depth: true,
};
export const gl = (canvas.getContext("webgl2", webglOptions) ||
  canvas.getContext("webgl", webglOptions)) as WebGLRenderingContext;
