import { canvas } from "./canvas";
import { onTouchStart, onTouchMove, onTouchEnd } from "./renderer/camera";
import { onTap } from "./action";
import { Handler } from "./controls-type";

let downTimeStamp = 0;
const onStart: Handler = (t) => {
  downTimeStamp = Date.now();

  onTouchStart(t);
};
const onMove: Handler = (t) => {
  onTouchMove(t);
};
const onEnd: Handler = (t) => {
  onTouchEnd(t);

  if (Date.now() < downTimeStamp + 300) onTap(t);
};

canvas.addEventListener("mousedown", (event) => onStart([event]));
canvas.addEventListener("mousemove", (event) => onMove([event]));
canvas.addEventListener("mouseup", (event) => onEnd([event]));

canvas.addEventListener(
  "touchstart",
  (event) => onStart(Array.from(event.touches)),
  { passive: true }
);
canvas.addEventListener(
  "touchmove",
  (event) => onMove(Array.from(event.touches)),
  { passive: true }
);
canvas.addEventListener(
  "touchend",
  (event) => onEnd(Array.from(event.touches)),
  { passive: true }
);
