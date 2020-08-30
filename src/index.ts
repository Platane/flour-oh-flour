import "./canvas";

import { render } from "./renderer/render";
import { getDelaunayTriangulation } from "./math/getDelaunayTriangulation";
import { vec2 } from "gl-matrix";
import { getVoronoiTesselation } from "./math/getVoronoiTesselation";

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
    { length: 300 },
    () =>
      [
        (Math.random() * 1.6 - 0.3) * window.innerWidth,
        (Math.random() * 1.6 - 0.3) * window.innerHeight,
      ] as vec2
  );

  // getDelaunayTriangulation(points).forEach(([a, b, c]) => {
  //   ctx.beginPath();
  //   ctx.fillStyle = `hsla(${Math.random() * 360},90%,50%,0.2)`;
  //   ctx.moveTo(points[a][0], points[a][1]);
  //   ctx.lineTo(points[b][0], points[b][1]);
  //   ctx.lineTo(points[c][0], points[c][1]);
  //   ctx.fill();
  // });

  const { vertices, faces } = getVoronoiTesselation(points);
  faces.forEach((face) => {
    ctx.beginPath();
    ctx.fillStyle = `hsla(${Math.random() * 360},90%,50%,0.15)`;
    ctx.moveTo(vertices[face[0]][0], vertices[face[0]][1]);
    for (let i = face.length; i--; )
      ctx.lineTo(vertices[face[i]][0], vertices[face[i]][1]);
    ctx.fill();
  });
  ctx.strokeStyle = "#3333";
  ctx.lineWidth = 0.3;
  faces.forEach((face) => {
    ctx.beginPath();
    ctx.moveTo(vertices[face[0]][0], vertices[face[0]][1]);
    for (let i = face.length; i--; )
      ctx.lineTo(vertices[face[i]][0], vertices[face[i]][1]);
    ctx.stroke();
  });
}
