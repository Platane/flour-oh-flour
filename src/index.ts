import "./canvas";

import { render } from "./renderer/render";
import { delaunayTriangulation } from "./math/delaunayTriangulation";
import { vec2 } from "gl-matrix";

const loop = () => {
  render();

  requestAnimationFrame(loop);
};

loop();

{
  const canvas = document.createElement("canvas")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.zIndex = "-1";

  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;

  const points = Array.from(
    { length: 1800 },
    () =>
      [
        (Math.random() * 1.2 - 0.1) * window.innerWidth,
        (Math.random() * 1.2 - 0.1) * window.innerHeight,
      ] as vec2
  );
  delaunayTriangulation(points).forEach(([a, b, c]) => {
    ctx.beginPath();
    ctx.fillStyle = `hsla(${Math.random() * 360},90%,50%,0.2)`;
    ctx.moveTo(points[a][0], points[a][1]);
    ctx.lineTo(points[b][0], points[b][1]);
    ctx.lineTo(points[c][0], points[c][1]);
    ctx.fill();
  });
}
