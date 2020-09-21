import { raycastFromScreen } from "./renderer/raycast";
import { actionStack } from "./logic";
import { Handler } from "./controls-type";
import { triangles } from "./generation/terrain/mesh";

export const onTap: Handler = ([{ pageX, pageY }]) => {
  const x = (pageX / window.innerWidth) * 2 - 1;
  const y = -((pageY / window.innerHeight) * 2 - 1);

  const u = raycastFromScreen(x, y);

  if (!u) return;

  const cellIndex = triangles[u.i].cellIndex;

  if (cellIndex !== null)
    actionStack.push({
      type: "work-cell",
      cellIndex,
      touchPosition: u.p,
    });
};
