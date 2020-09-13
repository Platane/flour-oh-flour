import { vertices as staticVertices } from "./renderer/globalBuffers/static";
import { raycastFromScreen } from "./renderer/raycast";
import { date } from "./logic";
import { Handler } from "./controls-type";
import { vec3 } from "gl-matrix";
import { fieldsN } from "./renderer/meshes/terrain";

export let hoveredPosition: vec3 | null = null;
export let hoveredDate = -9999;

export const onHover: Handler = ([{ pageX, pageY }]) => {
  const x = (pageX / window.innerWidth) * 2 - 1;
  const y = -((pageY / window.innerHeight) * 2 - 1);

  const u = raycastFromScreen(x, y, staticVertices as any, fieldsN);

  if (u) {
    hoveredPosition = u.p;
    hoveredDate = date;
  } else {
    // hoveredPosition = null;
  }
};
