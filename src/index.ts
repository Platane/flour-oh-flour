import "./mock-random";
import "./controls";
import "./action";

import { stepWorld } from "./logic";
import { render } from "./renderer/render";

// import "./renderer/meshes/terrain-debug";

render();

const loop = () => {
  render();
  stepWorld();
  requestAnimationFrame(loop);
};

const splash = document.getElementById("splash")!;

const onClick = () => {
  splash.removeEventListener("click", onClick);
  splash.style.opacity = "0";
  setTimeout(() => splash.parentElement!.removeChild(splash), 200);
  loop();
};
splash.addEventListener("click", onClick);
