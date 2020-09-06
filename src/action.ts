import { staticVertices, activeFaces } from "./renderer/meshes/terrain";
import { raycast } from "./renderer/raycast";
import { actionStack } from "./logic";
import { Handler } from "./controls-type";

export const onTap: Handler = ([{ pageX, pageY }]) => {
  const x = (pageX / window.innerWidth) * 2 - 1;
  const y = -((pageY / window.innerHeight) * 2 - 1);

  const u = raycast(x, y, staticVertices);

  if (u && activeFaces[u.i] !== undefined)
    actionStack.push({
      type: "work-cell",
      cellIndex: activeFaces[u.i],
      touchPosition: u.p,
    });
};
