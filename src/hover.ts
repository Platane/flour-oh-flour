import { vec3 } from "gl-matrix";
import { raycastFromScreen } from "./renderer/raycast";
import { date } from "./logic";
import { Handler } from "./controls-type";

export let hoveredPosition: vec3 | null = null;
export let hoveredDate = -9999;

export const onHover: Handler = ([{ pageX, pageY }]) => {
  const x = (pageX / window.innerWidth) * 2 - 1;
  const y = -((pageY / window.innerHeight) * 2 - 1);

  const u = raycastFromScreen(x, y);

  if (u) {
    hoveredPosition = u.p;
    hoveredDate = date;
  } else {
    // hoveredPosition = null;
  }
};
