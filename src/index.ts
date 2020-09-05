import "./mock-random";
import "./canvas";

import { render } from "./renderer/render";
import { vec2 } from "gl-matrix";
import { getVoronoiTesselation } from "./math/getVoronoiTesselation";
import { update as updateCursor } from "./renderer/meshes/cursor";
import { fVertices } from "./renderer/meshes/terrain";
import { raycast } from "./renderer/raycast";
import { createCanvas } from "./debugCanvas";

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

  // document.body.appendChild(canvas);

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

const ctx = createCanvas().getContext("2d")!;

document.body.addEventListener(
  "mousemove",
  ({ pageX, pageY }) => {
    const x = (pageX / window.innerWidth) * 2 - 1;
    const y = -((pageY / window.innerHeight) * 2 - 1);

    const u = raycast(x, y, fVertices as any);

    updateCursor(u?.p || null);
  },
  { passive: true }
);

// raycaster test
{
  let k = 0;
  const l = 8;
  const w = Math.ceil(window.innerWidth / l);
  const h = Math.ceil(window.innerHeight / l);
  const lloop = () => {
    const s = Date.now();

    while (Date.now() - s < 5)
      for (let u = 30; u--; ) {
        if (k > w * h) k = 0;

        const sx = k % w;
        const sy = Math.floor(k / w);

        const x = ((sx + 0.5) / w) * 2 - 1;
        const y = -(((sy + 0.5) / h) * 2 - 1);

        const u = raycast(x, y, fVertices as any);

        ctx.fillStyle = u
          ? `hsl(0,40%,${((u.t - 1) / 7) * 100}%)`
          : `hsl(0,0%,${Math.random() * 4 + 90}%)`;
        ctx.fillRect(sx * l, sy * l, l, l);

        k++;
      }

    requestAnimationFrame(lloop);
  };
  lloop();
}
