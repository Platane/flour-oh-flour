import { vec3 } from "gl-matrix";
import { z, up, x, zero } from "../../constant";
import { basicDynamic } from "../materials";
import { raycastFromScreen } from "../raycast";
import { dynamicUpdates } from "../shared";

export const cursorPosition: vec3 = [0, 0, 0];

const update = () => {
  const base = [up, x, z];

  for (let k = 3; k--; ) {
    const u = base[(k + 0) % 3];
    const v = base[(k + 1) % 3];
    const n = base[(k + 2) % 3];

    const kernel = [
      [-1, 1],
      [-1, -1],
      [1, -1],
      [1, 1],
    ] as const;

    const s = 0.003;

    for (const tn of [1, -1]) {
      const vertices = kernel.map(([tu, tv]) => {
        const p: vec3 = cursorPosition.slice() as any;

        vec3.scaleAndAdd(p, p, n, tn * s);
        vec3.scaleAndAdd(p, p, u, tu * s);
        vec3.scaleAndAdd(p, p, v, tv * s);

        return p;
      });

      if (tn === -1) vertices.reverse();

      basicDynamic.pushFlatFace(vertices, n);
    }
  }
};

dynamicUpdates.push(update);

document.body.addEventListener(
  "mousemove",
  ({ pageX, pageY }) => {
    const x = (pageX / window.innerWidth) * 2 - 1;
    const y = -((pageY / window.innerHeight) * 2 - 1);

    const u = raycastFromScreen(x, y);

    vec3.copy(cursorPosition, u ? u.p : zero);
  },
  { passive: true }
);
