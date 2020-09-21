import { vec3, mat4 } from "gl-matrix";
import { up, x, z } from "../../constant";
import {
  flourBagBodyColor,
  flourBagPlankColor,
  wheatColorEnd,
} from "../colors";
import { BasicMaterial } from "../materials/basic";

const base = [up, x, z];

export const bagSize = 0.016;

const plankWidth = 0.15;
const plankThickness = 0.04;
const plankGap = 0.0;
const logoSize = 0.34;

const kernel = [
  {
    faces: [
      [
        [0, 0, 0],
        [plankWidth, 0, 0],
        [plankWidth, 1, 0],
        [0, 1, 0],
      ],

      [
        [1 - plankWidth, 0, 0],
        [1, 0, 0],
        [1, 1, 0],
        [1 - plankWidth, 1, 0],
      ],

      [
        [plankWidth + plankGap, 0, 0],
        [1 - (plankWidth + plankGap), 0, 0],
        [1 - (plankWidth + plankGap), plankWidth, 0],
        [plankWidth + plankGap, plankWidth, 0],
      ],

      [
        [1 - (plankWidth + plankGap), 1, 0],
        [plankWidth + plankGap, 1, 0],
        [plankWidth + plankGap, 1 - plankWidth, 0],
        [1 - (plankWidth + plankGap), 1 - plankWidth, 0],
      ],

      // [
      //   [plankWidth + plankGap, 1 - plankWidth, plankThickness],
      //   [1 - (plankWidth + plankGap), 1 - plankWidth, plankThickness],
      //   [1 - (plankWidth + plankGap), 1 - plankWidth, 0],
      //   [plankWidth + plankGap, 1 - plankWidth, 0],
      // ],

      // [
      //   [1 - (plankWidth + plankGap), plankWidth, plankThickness],
      //   [plankWidth + plankGap, plankWidth, plankThickness],
      //   [plankWidth + plankGap, plankWidth, 0],
      //   [1 - (plankWidth + plankGap), plankWidth, 0],
      // ],

      // [
      //   [plankWidth, plankWidth + plankGap, plankThickness],
      //   [plankWidth, 1 - (plankWidth + plankGap), plankThickness],
      //   [plankWidth, 1 - (plankWidth + plankGap), 0],
      //   [plankWidth, plankWidth + plankGap, 0],
      // ],

      // [
      //   [1 - plankWidth, 1 - (plankWidth + plankGap), plankThickness],
      //   [1 - plankWidth, plankWidth + plankGap, plankThickness],
      //   [1 - plankWidth, plankWidth + plankGap, 0],
      //   [1 - plankWidth, 1 - (plankWidth + plankGap), 0],
      // ],
    ],
    color: flourBagPlankColor,
  },
  {
    faces: [
      [
        [plankThickness, plankThickness, plankThickness],
        [1 - plankThickness, plankThickness, plankThickness],
        [1 - plankThickness, 1 - plankThickness, plankThickness],
        [plankThickness, 1 - plankThickness, plankThickness],
      ],
    ],
    color: flourBagBodyColor,
  },
  {
    faces: [
      Array.from({ length: 3 }).map((_, i, arr) => [
        Math.sin(412 + (-i / arr.length) * Math.PI * 2) * logoSize * 0.5 + 0.5,
        Math.cos(412 + (-i / arr.length) * Math.PI * 2) * logoSize * 0.5 + 0.5,
        plankThickness - 0.005,
      ]),
    ],
    color: wheatColorEnd,
  },
];

export const createFlourBag = (transform: mat4, material: BasicMaterial) => {
  for (let k = 6; k--; ) {
    const u = base[(k + 0) % 3];
    const v = base[(k + 1) % 3];
    const n = base[(k + 2) % 3];

    const s = k >= 3 ? 1 : -1;

    for (const { faces, color } of kernel)
      for (const face of faces) {
        const vertices = face.map(([x, y, z]: any) => {
          const p: vec3 = [0, 0, 0] as any;

          vec3.scaleAndAdd(p, p, n, (x - 0.5) * bagSize);
          vec3.scaleAndAdd(p, p, u, (y - 0.5) * bagSize);
          vec3.scaleAndAdd(p, p, v, (z - 0.5) * bagSize * s);
          vec3.transformMat4(p, p, transform);

          return p;
        });

        if (s === 1) vertices.reverse();

        material.pushFlatFace(vertices, color);
      }
  }
};
