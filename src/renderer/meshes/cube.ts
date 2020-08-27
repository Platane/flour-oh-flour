import { createMaterial } from "../materials";

// prettier-ignore
const vertices = [
    0,0,0,
    1,0,0,
    0,1,0,

    0,0,0,
    0,1,0,
    0,0,1,

    0,0,0,
    0,0,1,
    1,0,0,
]

// prettier-ignore
const faces = [
    0,1,2,
    3,4,5,
    6,7,8,
]

// prettier-ignore
const colors = [
    1,0,0,
    1,0,0,
    1,0,0,

    0,1,0,
    0,1,0,
    0,1,0,

    0,0,1,
    0,0,1,
    0,0,1,
]

const m = createMaterial();
m.updateGeometry(
  Uint16Array.from(faces),
  Float32Array.from(colors),
  Float32Array.from(vertices)
);

export const draw = m.draw;
