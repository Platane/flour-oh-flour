import { mat4, vec3, vec2, mat3 } from "gl-matrix";
import { canvas } from "../canvas";
import { clamp } from "../math/utils";
import { Handler } from "../controls-type";
import { up } from "../constant";

// initialize static perspective matrix
export const perspectiveMatrix = new Float32Array(4 * 4);
const fovX = Math.PI / 3;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.005;
const far = 20;
mat4.perspective(perspectiveMatrix, fovX, aspect, near, far);

// camera primitive
let phi = 1;
let theta = 0;
let zoom = 16;
const rotationSpeed = 3;
export const lookAtPoint: vec3 = [0, 0, 0];
export const eye: vec3 = [0, 0, 1];

// lookAtMatrix, build from the camera
export const lookAtMatrix = new Float32Array(4 * 4);

// combination or perspective and lookAt matrices
export const worldMatrix = new Float32Array(4 * 4);

// inverse of the 3x3 lookAt matrix
// used for bill boarding
export const lookAtMatrix3Inv = new Float32Array(3 * 3);

// unused
export const worlInverseTransposedMatrix = new Float32Array(4 * 4);

const update = () => {
  const radius = 0.1 + zoom * 0.5;

  const sinPhiRadius = Math.sin(phi) * radius;
  eye[0] = sinPhiRadius * Math.sin(theta);
  eye[1] = Math.cos(phi) * radius;
  eye[2] = sinPhiRadius * Math.cos(theta);
  mat4.lookAt(lookAtMatrix, eye, lookAtPoint, up);

  mat4.multiply(worldMatrix, perspectiveMatrix, lookAtMatrix);

  mat3.fromMat4(lookAtMatrix3Inv, lookAtMatrix);
  mat3.invert(lookAtMatrix3Inv, lookAtMatrix3Inv);
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

    phi = clamp(phi, 0.001, (4 * Math.PI) / 5);

    px = x;
    py = y;

    update();
  }
};
const rotateEnd = () => {
  px = null;
};

export const onTouchStart: Handler = ([{ pageX, pageY }]) => {
  rotateStart(pageX, pageY);
};
export const onTouchMove: Handler = ([{ pageX, pageY }]) => {
  rotateMove(pageX, pageY);
};
export const onTouchEnd: Handler = rotateEnd;

canvas.addEventListener(
  "wheel",
  (event) => {
    zoom = clamp(zoom + (event.deltaY < 0 ? -1 : 1), 0, 50);

    update();
  },
  { passive: true }
);
