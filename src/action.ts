import { activeFaces, fieldsN } from "./renderer/meshes/terrain";
import { vertices as staticVertices } from "./renderer/globalBuffers/static";
import { raycastFromScreen } from "./renderer/raycast";
import { actionStack } from "./logic";
import { Handler } from "./controls-type";

export const onTap: Handler = ([{ pageX, pageY }]) => {
  const x = (pageX / window.innerWidth) * 2 - 1;
  const y = -((pageY / window.innerHeight) * 2 - 1);

  const u = raycastFromScreen(x, y, staticVertices as any, fieldsN);

  if (u && activeFaces[u.i] !== undefined)
    actionStack.push({
      type: "work-cell",
      cellIndex: activeFaces[u.i],
      touchPosition: u.p,
    });
};
