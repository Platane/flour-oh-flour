export const createCanvas = () => {
  const canvas = document.createElement("canvas")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.zIndex = "-1";

  document.body.appendChild(canvas);

  return canvas;
};
