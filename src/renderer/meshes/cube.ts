import { createMaterial } from "../materials";
import { getFlatShadingNormals } from "../utils/flatShading";

// prettier-ignore
const vertices = Float32Array.from([
    0,0,0,
    1,0,0,
    0,1,0,

    0,0,0,
    0,1,0,
    0,0,1,

    0,0,0,
    0,0,1,
    1,0,0,
])

// // prettier-ignore
// const normals = [
//     0,0,1,
//     0,0,1,
//     0,0,1,

//     1,0,0,
//     1,0,0,
//     1,0,0,

//     0,1,0,
//     0,1,0,
//     0,1,0,
// ]

const h = -Math.hypot(1, 1, 1);
// prettier-ignore
const normals2 = Float32Array.from([
    h,h,h,
    1,0,0,
    0,1,0,

    h,h,h,
    0,1,0,
    0,0,1,

    h,h,h,
    0,0,1,
    1,0,0,
])

// prettier-ignore
const indexes = Uint16Array.from([
    0,1,2,
    3,4,5,
    6,7,8,
])

// prettier-ignore
const colors = Float32Array.from([
    1,0,0,
    1,0,0,
    1,0,0,

    0,1,0,
    0,1,0,
    0,1,0,

    0,0,1,
    0,0,1,
    0,0,1,
])

const m = createMaterial();
const normals = getFlatShadingNormals(indexes, vertices);
m.updateGeometry(indexes, colors, vertices, normals);

export const draw = m.draw;
