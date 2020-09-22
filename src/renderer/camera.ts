import { mat4, vec3, mat3 } from "gl-matrix";
import { canvas } from "../canvas";
import { clamp } from "../math/utils";
import { Handler } from "../controls-type";
import { up } from "../constant";
import {
  cameraOrigin,
  lookAtMatrix3Inv,
  worldMatrix,
  worldMatrixInv,
} from "./shared";

const maxZoom = 10;
const minZoom = 0;

// initialize static perspective matrix
const perspectiveMatrix = new Float32Array(4 * 4);
const fovX = Math.PI / 3;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.005;
const far = 8;
mat4.perspective(perspectiveMatrix, fovX, aspect, near, far);

// camera primitive
let phi = 1.2;
let theta = 1;
let zoom = Math.floor((maxZoom + minZoom) / 2);
const rotationSpeed = 3;
const lookAtPoint: vec3 = [0, 0, 0];

// lookAtMatrix, build from the camera
const lookAtMatrix = new Float32Array(4 * 4);

const update = () => {
  const radius = 0.8 + zoom * 0.09;

  const sinPhiRadius = Math.sin(phi) * radius;
  cameraOrigin[0] = sinPhiRadius * Math.sin(theta);
  cameraOrigin[1] = sinPhiRadius * Math.cos(theta);
  cameraOrigin[2] = Math.cos(phi) * radius;

  mat4.lookAt(lookAtMatrix, cameraOrigin, lookAtPoint, up);

  mat4.multiply(worldMatrix, perspectiveMatrix, lookAtMatrix);

  mat3.fromMat4(lookAtMatrix3Inv, lookAtMatrix);
  mat3.invert(lookAtMatrix3Inv, lookAtMatrix3Inv);

  mat4.invert(worldMatrixInv, worldMatrix);
};

update();

let zoom0 = 0;
let l0: number | null = null;

let px: number | null = null;
let py: number | null = null;

const rotateStart: Handler = ([{ pageX: x, pageY: y }]) => {
  px = x;
  py = y;
};
const rotateMove: Handler = ([{ pageX: x, pageY: y }]) => {
  if (px !== null) {
    const dx = x - px!;
    const dy = y - py!;

    theta += (dx / window.innerHeight) * rotationSpeed;
    phi -= (dy / window.innerHeight) * rotationSpeed;

    phi = clamp(phi, Math.PI / 12, (3 * Math.PI) / 4);

    px = x;
    py = y;

    update();
  }
};
const rotateEnd = () => {
  px = null;
};

const scaleStart: Handler = ([
  { pageX: ax, pageY: ay },
  { pageX: bx, pageY: by },
]) => {
  zoom0 = zoom;
  l0 = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
};
const scaleMove: Handler = (a) => {
  if (l0 !== null) {
    const [{ pageX: ax, pageY: ay }, { pageX: bx, pageY: by }] = a;

    const l = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);

    zoom = clamp((zoom0 / l) * l0, minZoom, maxZoom);

    update();
  }
};
const scaleEnd = () => {
  l0 = null;
};

export const onTouchStart: Handler = (touches) => {
  if (touches.length === 1) {
    scaleEnd();
    rotateStart(touches);
  } else if (touches.length > 1) {
    rotateEnd();
    scaleStart(touches);
  }
};
export const onTouchMove: Handler = (touches) => {
  scaleMove(touches);
  rotateMove(touches);
};
export const onTouchEnd: Handler = (touches) => {
  scaleEnd();
  rotateEnd();

  onTouchStart(touches);
};

canvas.addEventListener(
  "wheel",
  (event) => {
    zoom = clamp(zoom + (event.deltaY < 0 ? -1 : 1), minZoom, maxZoom);

    update();
  },
  { passive: true }
);
