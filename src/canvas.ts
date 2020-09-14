export const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;

const webglOptions = {
  antialias: true,
  depth: true,
};
export const gl = (canvas.getContext("webgl2", webglOptions) ||
  canvas.getContext("webgl", webglOptions)) as WebGLRenderingContext;
