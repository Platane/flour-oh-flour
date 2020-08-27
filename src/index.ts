import "./canvas";

import { render } from "./renderer/render";

const loop = () => {
  render();

  requestAnimationFrame(loop);
};

loop();
