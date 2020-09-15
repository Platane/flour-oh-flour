import { getAltitude } from "../generation/terrain/getAltitude";
import {
  getH,
  isInsidePotato,
  isInsideRawPotato,
  potatoBlobs,
} from "../generation/terrain/potato";
import { distanceToPotatoHull } from "../generation/terrain/potatoHull";
import { create, l, pixels, pixelsProj, s } from "./debug-generation-util";

{
  const ctx = create("blob map");

  for (const [x, y] of pixelsProj) {
    const h = getH(x, y);

    ctx.fillStyle = `hsl(0,0%,${h * 100}%)`;
    ctx.fillRect(x, y, s, s);
  }

  for (const [x, y, tau] of potatoBlobs) {
    ctx.beginPath();
    ctx.fillStyle = "orange";
    ctx.fillRect(x, y, s * 40 * tau, s * 40 * tau);
  }
}

{
  const ctx = create("potato");

  for (const [x, y] of pixelsProj) {
    ctx.fillStyle = isInsideRawPotato(x, y) ? `#fff` : `#880`;

    ctx.fillRect(x, y, s, s);
  }
}

{
  create("centered potato");
}

{
  const ctx = create("distance to hull");

  for (const [x, y] of pixelsProj) {
    const h = distanceToPotatoHull(x, y, 0.3);
    ctx.fillStyle = `hsl(0,0%,${(h / 0.3) * 100}%)`;

    ctx.fillRect(x, y, s, s);
  }
}

{
  const ctx = create("get altitude");

  for (const [x, y] of pixelsProj)
    if (isInsidePotato(x, y)) {
      const h = getAltitude(x, y);
      ctx.fillStyle = `hsl(0,0%,${h * 400}%)`;

      ctx.fillRect(x, y, s, s);
    }
}
