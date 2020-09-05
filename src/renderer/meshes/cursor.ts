import { createMaterial } from "../materials";
import { getFlatShadingNormals } from "../utils/flatShading";
import { vec3 } from "gl-matrix";

// prettier-ignore
const normals = Float32Array.from([
    0,0,1,
    0,0,1,
    0,0,1,

    1,0,0,
    1,0,0,
    1,0,0,

    0,1,0,
    0,1,0,
    0,1,0,
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

export const update = (c: vec3 | null) => {
  if (!c) {
    m.updateGeometry(
      new Float32Array(),
      new Float32Array(),
      new Float32Array()
    );
  } else {
    const u = 0.1;
    const vertices = Float32Array.from(
      // prettier-ignore
      [
              0,0,0,
              u,0,0,
              0,u,0,
              
              0,0,0,
              0,u,0,
              0,0,u,
              
              0,0,0,
              0,0,u,
              u,0,0,
            ]
    ).map((x, i) => x + c[i % 3]);

    m.updateGeometry(colors, vertices, normals);
  }
};

export const draw = m.draw;
