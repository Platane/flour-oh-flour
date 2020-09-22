import { cells, debugFaces, vertices } from "../generation/terrain/cells";
import {
  debugOriginFillIndexes,
  debugOriginFillPoints,
  debugAfterFillIndexes,
  debugAfterFillPoints,
} from "../generation/terrain/fill";

import { create, l, polygon, s } from "./debug-generation-util";

{
  const ctx = create("cell candidated");

  for (const face of debugFaces) {
    ctx.fillStyle = `hsla(${Math.random() * 320},100%,80%,0.8)`;
    polygon(ctx, face.map((k) => vertices[k]) as any);
    ctx.fill();
  }
  for (const face of debugFaces) {
    polygon(ctx, face.map((k) => vertices[k]) as any);
    ctx.stroke();
  }
}

{
  const ctx = create("selected cells");

  for (const cell of cells) {
    ctx.fillStyle = `hsl(${Math.random() * 320},100%,80%)`;
    polygon(ctx, cell as any);
    ctx.fill();
  }
  for (const cell of cells) {
    polygon(ctx, cell as any);
    ctx.stroke();
  }
}

{
  const ctx = create("mesh points");

  for (const p of debugOriginFillPoints) {
    const r = 2;
    ctx.fillStyle = "#42a";
    ctx.rect(
      Math.floor((p[0] - (s * r) / 2) * l) / l,
      Math.floor((p[1] - (s * r) / 2) * l) / l,
      s * r,
      s * r
    );
    ctx.fill();
  }

  ctx.lineWidth = 0.5 * s;
  for (const cell of cells) {
    polygon(ctx, cell as any);
    ctx.stroke();
  }
}

{
  const ctx = create("meshes split");

  ctx.lineWidth = 0.3 * s;
  ctx.strokeStyle = "#31b3";
  for (const indexes of debugOriginFillIndexes) {
    polygon(
      ctx,
      indexes.map((k) => debugOriginFillPoints[k] as any)
    );
    ctx.stroke();
  }

  for (const p of debugOriginFillPoints) {
    const r = 1;
    ctx.fillStyle = "#42a";
    ctx.beginPath();
    ctx.rect(
      Math.floor((p[0] - (s * r) / 2) * l) / l,
      Math.floor((p[1] - (s * r) / 2) * l) / l,
      s * r,
      s * r
    );
    ctx.fill();
  }

  for (const p of debugAfterFillPoints.slice(debugOriginFillPoints.length)) {
    const r = 3;
    ctx.fillStyle = "#a42";
    ctx.beginPath();
    ctx.rect(
      Math.floor((p[0] - (s * r) / 2) * l) / l,
      Math.floor((p[1] - (s * r) / 2) * l) / l,
      s * r,
      s * r
    );
    ctx.fill();
  }

  ctx.lineWidth = 0.5 * s;
  ctx.strokeStyle = "#000";
  for (const cell of cells) {
    polygon(ctx, cell as any);
    ctx.stroke();
  }
}

{
  const ctx = create("meshes after culling");

  ctx.lineWidth = 0.3 * s;
  for (const indexes of debugAfterFillIndexes) {
    polygon(
      ctx,
      indexes.map((k) => debugAfterFillPoints[k] as any)
    );
    ctx.stroke();
  }

  ctx.lineWidth = 0.5 * s;
  for (const cell of cells) {
    polygon(ctx, cell as any);
    ctx.stroke();
  }
}
