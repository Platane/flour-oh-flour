import "./mock-random";
import "./controls";
import "./action";

import { stepWorld } from "./logic";
import { render } from "./renderer/render";

const loop = () => {
  stepWorld();
  render();
  requestAnimationFrame(loop);
};

loop();
