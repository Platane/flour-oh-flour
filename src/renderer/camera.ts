import { mat4, vec3 } from "gl-matrix";
import { canvas } from "../canvas";
import { clamp } from "../math/utils";

const perspectiveMatrix = new Float32Array(4 * 4);
const lookAtMatrix = new Float32Array(4 * 4);

const fovx = Math.PI / 3;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.01;
const far = 12;
mat4.perspective(perspectiveMatrix, fovx, aspect, near, far);

export const worldMatrix = new Float32Array(4 * 4);
export const worlInverseTransposedMatrix = new Float32Array(4 * 4);

let phi = 1;
let theta = 1;
let radius = 2;

const rotationSpeed = 3;
const up: vec3 = [0, 1, 0];
const center: vec3 = [0, 0, 0];
const eye: vec3 = [0, 0, 1];

const update = () => {
  const sinPhiRadius = Math.sin(phi) * radius;
  eye[0] = sinPhiRadius * Math.sin(theta);
  eye[1] = Math.cos(phi) * radius;
  eye[2] = sinPhiRadius * Math.cos(theta);
  mat4.lookAt(lookAtMatrix, eye, center, up);

  mat4.multiply(worldMatrix, perspectiveMatrix, lookAtMatrix);

  // mat4.transpose(worlInverseTransposedMatrix, worldMatrix);
  // mat4.invert(worlInverseTransposedMatrix, worlInverseTransposedMatrix);

  mat4.invert(worlInverseTransposedMatrix, worldMatrix);
  mat4.transpose(worlInverseTransposedMatrix, worlInverseTransposedMatrix);
};

update();

let px: number | null = null;
let py: number | null = null;

const rotateStart = (x: number, y: number) => {
  px = x;
  py = y;
};
const rotateMove = (x: number, y: number) => {
  if (px !== null) {
    const dx = x - px!;
    const dy = y - py!;

    theta -= (dx / window.innerHeight) * rotationSpeed;
    phi -= (dy / window.innerHeight) * rotationSpeed;

    phi = clamp(phi, 0.001, (2 * Math.PI) / 3);

    px = x;
    py = y;

    update();
  }
};
const rotateEnd = () => {
  px = null;
};

canvas.addEventListener("mousedown", (event) =>
  rotateStart(event.pageX, event.pageY)
);
canvas.addEventListener("mousemove", (event) =>
  rotateMove(event.pageX, event.pageY)
);
canvas.addEventListener("mouseup", rotateEnd);

canvas.addEventListener(
  "touchstart",
  (event) => rotateStart(event.touches[0].pageX, event.touches[0].pageY),
  { passive: true }
);
canvas.addEventListener(
  "touchmove",
  (event) => rotateMove(event.touches[0].pageX, event.touches[0].pageY),
  { passive: true }
);
canvas.addEventListener("touchend", rotateEnd, { passive: true });

canvas.addEventListener(
  "wheel",
  (event) => {
    radius = clamp(radius + (event.deltaY < 0 ? -0.5 : 0.5), 0.5, 10);

    update();
  },
  { passive: true }
);
