import {
  isInsidePotato,
  cells,
  fillPoints,
  originalFillPoints,
  fillIndexes,
  originalFillIndexes,
} from "./terrain";
import { vec2 } from "gl-matrix";

const l = 900;
const potatoCanvas = document.createElement("canvas");

const debugContainer = document.createElement("div");
document.body.appendChild(debugContainer);
debugContainer.style.position = "absolute";
debugContainer.style.top = "0px";
debugContainer.style.left = "0px";
debugContainer.style.zIndex = "3";
debugContainer.style.overflow = "scroll";
debugContainer.style.width = "100%";
debugContainer.style.display = "flex";
debugContainer.style.flexDirection = "column";
debugContainer.style.justifyContent = "start";
debugContainer.style.alignItems = "start";
debugContainer.style.flexDirection = "column";
debugContainer.addEventListener("click", () => {
  debugContainer.style.display = "none";
});

{
  potatoCanvas.width = l;
  potatoCanvas.height = l;

  const ctx = potatoCanvas.getContext("2d")!;

  for (let sx = l; sx--; )
    for (let sy = l; sy--; ) {
      const x = sx / l;
      const y = sy / l;

      ctx.fillStyle = `#880`;
      if (isInsidePotato(x, y)) {
        ctx.fillStyle = `#fff`;

        //   const distance = distanceToPotato(x, y);

        //   ctx.fillStyle = `hsl(${distance * 120},80%,80%)`;
        //   ctx.fillStyle = `hsl(${distance * 120},0%,${distance * 100}%)`;
      }

      ctx.fillRect(sx, sy, 1, 1);
    }
}

const polygon = (ctx: CanvasRenderingContext2D, arr: vec2[]) => {
  ctx.beginPath();
  ctx.moveTo(arr[0][0] * l, arr[0][1] * l);
  for (let i = arr.length; i--; ) ctx.lineTo(arr[i][0] * l, arr[i][1] * l);
  ctx.closePath();
};

{
  const c = document.createElement("canvas");
  c.width = l;
  c.height = l;
  debugContainer.appendChild(c);
  const ctx = c.getContext("2d")!;

  ctx.drawImage(potatoCanvas, 0, 0);

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
  const c = document.createElement("canvas");
  c.width = l;
  c.height = l;
  debugContainer.appendChild(c);
  const ctx = c.getContext("2d")!;

  ctx.drawImage(potatoCanvas, 0, 0);

  for (const p of originalFillPoints) {
    const r = 3;
    ctx.fillStyle = "#42a";
    // ctx.rect(0 | (p[0] * l), 0 | (p[1] * l), 1, 1);
    ctx.rect(0 | (p[0] * l - r / 2), 0 | (p[1] * l - r / 2), r, r);
    ctx.fill();
  }

  ctx.lineWidth = 0.5;
  for (const cell of cells) {
    polygon(ctx, cell as any);
    ctx.stroke();
  }
}

//
//
//
{
  const c = document.createElement("canvas");
  c.width = l;
  c.height = l;
  debugContainer.appendChild(c);
  const ctx = c.getContext("2d")!;

  ctx.drawImage(potatoCanvas, 0, 0);

  ctx.lineWidth = 0.4;
  ctx.strokeStyle = "#31b3";
  for (const indexes of originalFillIndexes) {
    polygon(
      ctx,
      indexes.map((k) => originalFillPoints[k] as any)
    );
    ctx.stroke();
  }

  for (const p of originalFillPoints) {
    const r = 2;
    ctx.fillStyle = "#42a";
    // ctx.rect(0 | (p[0] * l), 0 | (p[1] * l), 1, 1);
    ctx.beginPath();
    ctx.rect(0 | (p[0] * l - r / 2), 0 | (p[1] * l - r / 2), r, r);
    ctx.fill();
  }

  for (const p of fillPoints.slice(originalFillPoints.length)) {
    const r = 3;
    ctx.fillStyle = "#a42";
    // ctx.rect(0 | (p[0] * l), 0 | (p[1] * l), 1, 1);
    ctx.beginPath();
    ctx.rect(0 | (p[0] * l - r / 2), 0 | (p[1] * l - r / 2), r, r);
    ctx.fill();
  }

  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "#000";
  for (const cell of cells) {
    polygon(ctx, cell as any);
    ctx.stroke();
  }
}

//
//
//
{
  const c = document.createElement("canvas");
  c.width = l;
  c.height = l;
  debugContainer.appendChild(c);
  const ctx = c.getContext("2d")!;

  ctx.drawImage(potatoCanvas, 0, 0);

  ctx.lineWidth = 0.3;
  for (const indexes of fillIndexes) {
    polygon(
      ctx,
      indexes.map((k) => fillPoints[k] as any)
    );
    ctx.stroke();
  }

  for (const p of originalFillPoints) {
    const r = 2;
    ctx.fillStyle = "#42a";
    // ctx.rect(0 | (p[0] * l), 0 | (p[1] * l), 1, 1);
    ctx.beginPath();
    ctx.rect(0 | (p[0] * l - r / 2), 0 | (p[1] * l - r / 2), r, r);
    ctx.fill();
  }

  for (const p of fillPoints.slice(originalFillPoints.length)) {
    const r = 3;
    ctx.fillStyle = "#a42";
    // ctx.rect(0 | (p[0] * l), 0 | (p[1] * l), 1, 1);
    ctx.beginPath();
    ctx.rect(0 | (p[0] * l - r / 2), 0 | (p[1] * l - r / 2), r, r);
    ctx.fill();
  }

  for (const cell of cells) {
    polygon(ctx, cell as any);
    ctx.stroke();
  }
}

//   {
//     const c = createCanvas();
//     // c.style.left = 5 + l + "px";
//     const ctx = c.getContext("2d")!;

//     for (let sx = l; sx--; )
//       for (let sy = l; sy--; ) {
//         const x = sx / l;
//         const y = sy / l;

//         ctx.fillStyle = `#a00`;
//         if (isInsidePotato(x, y)) {
//           // const a = getAltitude(x, y);

//           ctx.fillStyle = `#fff`;
//           // ctx.fillStyle = `hsl(${a * 320},80%,80%)`;
//           // ctx.fillStyle = `hsl(${a * 120},0%,${a * 300}%)`;
//         }

//         ctx.fillRect(sx, sy, 1, 1);
//       }

//     // ctx.lineWidth = 0.5;
//     // ctx.fillStyle = `#ab3`;
//     // for (const cell of ccells) {
//     //   ctx.fillStyle = `hsl(${Math.random() * 80 + 280},100%,80%)`;

//     //   ctx.beginPath();
//     //   ctx.moveTo(cell[0][0] * l, cell[0][2] * l);
//     //   for (let i = cell.length; i--; )
//     //     ctx.lineTo(cell[i][0] * l, cell[i][2] * l);
//     //   ctx.fill();
//     //   ctx.stroke();
//     // }

//     ctx.fillStyle = `#23e`;
//     for (const p of fillPoints) {
//       const r = 4;
//       ctx.beginPath();
//       ctx.fillRect(p[0] * l - r / 2, p[1] * l - r / 2, r, r);
//     }

//     ctx.lineWidth = 0.25;
//     for (const [a, b, c] of fillIndexes) {
//       ctx.beginPath();
//       ctx.fillStyle = `hsla(${Math.random() * 100 + 100},100%,80%,0.35)`;
//       ctx.moveTo(fillPoints[a][0] * l, fillPoints[a][1] * l);
//       ctx.lineTo(fillPoints[b][0] * l, fillPoints[b][1] * l);
//       ctx.lineTo(fillPoints[c][0] * l, fillPoints[c][1] * l);
//       ctx.lineTo(fillPoints[a][0] * l, fillPoints[a][1] * l);
//       ctx.fill();
//     }
//     for (const [a, b, c] of fillIndexes) {
//       ctx.beginPath();
//       ctx.moveTo(fillPoints[a][0] * l, fillPoints[a][1] * l);
//       ctx.lineTo(fillPoints[b][0] * l, fillPoints[b][1] * l);
//       ctx.lineTo(fillPoints[c][0] * l, fillPoints[c][1] * l);
//       ctx.lineTo(fillPoints[a][0] * l, fillPoints[a][1] * l);
//       ctx.stroke();
//     }

//     ctx.lineWidth = 1;
//     ctx.strokeStyle = "#513";
//     for (const [a, b] of cellEdges) {
//       ctx.beginPath();
//       ctx.moveTo(a[0] * l, a[1] * l);
//       ctx.lineTo(b[0] * l, b[1] * l);
//       ctx.stroke();
//     }
//     // for (const indexes of cellCandidates.faces) {
//     //   ctx.beginPath();
//     //   ctx.moveTo(
//     //     cellCandidates.vertices[indexes[0]][0] * l,
//     //     cellCandidates.vertices[indexes[0]][1] * l
//     //   );
//     //   for (let i = indexes.length; i--; )
//     //     ctx.lineTo(
//     //       cellCandidates.vertices[indexes[i]][0] * l,
//     //       cellCandidates.vertices[indexes[i]][1] * l
//     //     );
//     //   ctx.stroke();
//     // }
//   }
// }
