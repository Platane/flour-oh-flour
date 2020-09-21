import { raycastFromScreen } from "../renderer/raycast";
import { debugContainer } from "./debug-util";

{
  const l = 100;
  const c = document.createElement("canvas");
  c.title = "raycast";
  c.style.margin = "4px";
  c.width = l;
  c.height = l;
  debugContainer.appendChild(c);
  const ctx = c.getContext("2d")!;

  for (let x = l; x--; )
    for (let y = l; y--; ) {
      const u = raycastFromScreen((x / l) * 2 - 1, -((y / l) * 2 - 1));

      ctx.beginPath();
      ctx.fillStyle = `hsl(0,0%,${((u && u.t) || 100) * 60}%)`;
      ctx.fillRect(x, y, 1, 1);
    }
}

{
  const l = 100;
  const c = document.createElement("canvas");
  c.title = "raycast";
  c.style.margin = "4px";
  c.width = l;
  c.height = l;
  debugContainer.appendChild(c);
  const ctx = c.getContext("2d")!;

  let k = 0;

  const loop = () => {
    const s = Date.now();
    while (Date.now() - s < 6) {
      for (let i = 20; i--; ) {
        const x = k % l;
        const y = Math.floor(k / l) % l;

        const u = raycastFromScreen((x / l) * 2 - 1, -((y / l) * 2 - 1));

        ctx.beginPath();
        ctx.fillStyle = `hsl(0,0%,${((u && u.t) || 100) * 30}%)`;
        ctx.fillRect(x, y, 1, 1);

        k++;
        if (k === l * l) k = 0;
      }
    }

    requestAnimationFrame(loop);
  };
  loop();
}
