import { activeFaces } from "./renderer/meshes/terrain";
import {
  vertices as staticVertices,
  n as staticN,
} from "./renderer/globalBuffers/static";
import { raycast } from "./renderer/raycast";
import { actionStack } from "./logic";
import { Handler } from "./controls-type";

export const onTap: Handler = ([{ pageX, pageY }]) => {
  const x = (pageX / window.innerWidth) * 2 - 1;
  const y = -((pageY / window.innerHeight) * 2 - 1);

  const u = raycast(x, y, staticVertices as any, staticN);

  if (u && activeFaces[u.i] !== undefined)
    actionStack.push({
      type: "work-cell",
      cellIndex: activeFaces[u.i],
      touchPosition: u.p,
    });
};
