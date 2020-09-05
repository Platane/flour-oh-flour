export const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;
canvas.style.opacity = "0.6";
// const p = generatePerlinNoise(canvas.width, canvas.height, 260);
// const l = 2;
// for (let x = 0; x < canvas.width / l; x++)
//   for (let y = 0; y < canvas.height / l; y++) {
//     const k = 0.5 + 0.5 * p((x + 0.5) * l, (y + 0.5) * l);

//     ctx.fillStyle = `hsl(${k * 320},60%,60%)`;

//     ctx.fillRect(x * l, y * l, l, l);
//   }

const webglOptions = {
  // alpha: true,
  // preserveDrawingBuffer: false,
  // premultipliedAlpha: false,
  // stencil: true,
  antialias: true,
  depth: true,
};
export const gl = (canvas.getContext("webgl2", webglOptions) ||
  canvas.getContext("webgl", webglOptions)) as WebGLRenderingContext;
