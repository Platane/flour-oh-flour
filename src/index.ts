import "./renderer/camera";
import "./debug/mock-random";
// import "./debug/debug-generation-potato";
// import "./debug/debug-generation-mesh";
// import "./debug/debug-raycasting";
import "./controls";

import { stepWorld } from "./logic";
import "./action";
import { render } from "./renderer/render";

render();

const loop = () => {
  render();
  stepWorld();
  requestAnimationFrame(loop);
};

loop();

const splash = document.getElementById("splash")!;
splash.style.opacity = "0";

// const onClick = () => {
//   splash.removeEventListener("click", onClick);
//   splash.style.opacity = "0";
//   setTimeout(() => splash.parentElement!.removeChild(splash), 200);
//   loop();
// };
// splash.addEventListener("click", onClick);
