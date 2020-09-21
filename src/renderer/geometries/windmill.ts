import { vec3, mat4 } from "gl-matrix";
import { date } from "../../logic";
import {
  windmillBodyColor,
  windmillPlankColor,
  windmillWingColor,
} from "../colors";
import { basicDynamic, basicStatic } from "../materials";

export const createWindmill = (transform: mat4) => {
  // body
  const bodyTopRadius = 1;
  const bodyBottomRadius = 1.25;
  const bodyHeight = 1.8;

  const footTopRadius = 0.5;
  const footBottomRadius = 0.95;
  const footHeight = 0.6;
  const baseExtensionHeight = 1.85;

  const roofRadius = 1.32;
  const roofHeight = 0.68;

  const plankDepth = 0.055;
  const plankWidth = 0.18;
  const plankCapWidth = 0.3;

  // wings
  const wingO: vec3 = [0, -1.17, 2.16];
  const wingL = 1.9;
  const wingMarginO = 0.1;
  const wingTopH = 0.4;
  const wingBottomH = 0.1;
  const wingDepth = 0.035;
  const wingXm = 0.04;

  const n = 5;

  for (let i = 0; i < n; i++) {
    let a = (i * Math.PI * 2) / n;
    let b = ((i + 1) * Math.PI * 2) / n;

    const ax = Math.sin(a);
    const bx = Math.sin(b);
    const ay = Math.cos(a);
    const by = Math.cos(b);

    for (const face of [
      // prettier-ignore
      [
        [ bodyBottomRadius * bx, bodyBottomRadius * by, footHeight + 0         ],
        [ bodyBottomRadius * ax, bodyBottomRadius * ay, footHeight + 0         ],
        [ bodyTopRadius    * ax, bodyTopRadius    * ay, footHeight + bodyHeight],
        [ bodyTopRadius    * bx, bodyTopRadius    * by, footHeight + bodyHeight],
      ],

      // prettier-ignore
      [
        [ footBottomRadius * bx, footBottomRadius * by, 0               ],
        [ footBottomRadius * ax, footBottomRadius * ay, 0               ],
        [ footTopRadius    * ax, footTopRadius    * ay, footHeight * 1.1],
        [ footTopRadius    * bx, footTopRadius    * by, footHeight * 1.1],
      ],

      // prettier-ignore
      [
        [ footBottomRadius * ax, footBottomRadius * ay,  0                  ],
        [ footBottomRadius * bx, footBottomRadius * by,  0                  ],
        [ footBottomRadius * bx, footBottomRadius * by, -baseExtensionHeight],
        [ footBottomRadius * ax, footBottomRadius * ay, -baseExtensionHeight],
      ],

      // prettier-ignore
      [
        [ roofRadius * bx, roofRadius * by, footHeight + bodyHeight             ],
        [ roofRadius * ax, roofRadius * ay, footHeight + bodyHeight             ],
        [ 0              , 0              , footHeight + bodyHeight + roofHeight],
      ],

      // prettier-ignore
      [
        [ bodyBottomRadius * ax, bodyBottomRadius * ay, footHeight      ],
        [ bodyBottomRadius * bx, bodyBottomRadius * by, footHeight      ],
        [ 0                    , 0                    , footHeight * 0.4],
      ],

      // prettier-ignore
      [
        [ roofRadius * bx, roofRadius * by, footHeight + bodyHeight],
        [ 0              , 0              , footHeight + bodyHeight],
        [ roofRadius * ax, roofRadius * ay, footHeight + bodyHeight],
      ],
    ]) {
      basicStatic.pushFlatFace(
        face.map((v: any) => vec3.transformMat4([] as any, v, transform)),
        windmillBodyColor
      );
    }

    let vy = by - ay;
    let vx = bx - ax;
    const l = Math.sqrt(vx * vx + vy * vy);

    vy /= l;
    vx /= l;

    for (const face of [
      // prettier-ignore
      [
        [ ( bodyTopRadius    + plankDepth ) * ax + vx * plankWidth, ( bodyTopRadius    + plankDepth ) * ay + vy * plankWidth, footHeight + bodyHeight ],
        [ ( bodyBottomRadius + plankDepth ) * ax + vx * plankWidth, ( bodyBottomRadius + plankDepth ) * ay + vy * plankWidth, footHeight + 0          ],
        [ ( bodyBottomRadius + plankDepth ) * ax                  , ( bodyBottomRadius + plankDepth ) * ay                  , footHeight + 0          ],
        [ ( bodyTopRadius    + plankDepth ) * ax                  , ( bodyTopRadius    + plankDepth ) * ay                  , footHeight + bodyHeight ],
      ],

      // prettier-ignore
      [
        [ ( bodyBottomRadius + plankDepth ) * bx - vx * plankWidth, ( bodyBottomRadius + plankDepth ) * by - vy * plankWidth, footHeight + 0          ],
        [ ( bodyTopRadius    + plankDepth ) * bx - vx * plankWidth, ( bodyTopRadius    + plankDepth ) * by - vy * plankWidth, footHeight + bodyHeight ],
        [ ( bodyTopRadius    + plankDepth ) * bx                  , ( bodyTopRadius    + plankDepth ) * by                  , footHeight + bodyHeight ],
        [ ( bodyBottomRadius + plankDepth ) * bx                  , ( bodyBottomRadius + plankDepth ) * by                  , footHeight + 0          ],
      ],

      // prettier-ignore
      [
        [ ( bodyTopRadius    + plankDepth ) * bx - vx * plankWidth, ( bodyTopRadius    + plankDepth ) * by - vy * plankWidth, footHeight + bodyHeight ],
        [ ( bodyBottomRadius + plankDepth ) * bx - vx * plankWidth, ( bodyBottomRadius + plankDepth ) * by - vy * plankWidth, footHeight + 0          ],
        [ ( bodyBottomRadius              ) * bx - vx * plankWidth, ( bodyBottomRadius              ) * by - vy * plankWidth, footHeight + 0          ],
        [ ( bodyTopRadius                 ) * bx - vx * plankWidth, ( bodyTopRadius                 ) * by - vy * plankWidth, footHeight + bodyHeight ],
      ],

      // prettier-ignore
      [
        [ ( bodyBottomRadius + plankDepth ) * ax + vx * plankWidth, ( bodyBottomRadius + plankDepth ) * ay + vy * plankWidth, footHeight + 0          ],
        [ ( bodyTopRadius    + plankDepth ) * ax + vx * plankWidth, ( bodyTopRadius    + plankDepth ) * ay + vy * plankWidth, footHeight + bodyHeight ],
        [ ( bodyTopRadius                 ) * ax + vx * plankWidth, ( bodyTopRadius                 ) * ay + vy * plankWidth, footHeight + bodyHeight ],
        [ ( bodyBottomRadius              ) * ax + vx * plankWidth, ( bodyBottomRadius              ) * ay + vy * plankWidth, footHeight + 0          ],
      ],

      // prettier-ignore
      [
        [ ( bodyBottomRadius + plankDepth ) * ax + vx * plankWidth, ( bodyBottomRadius + plankDepth ) * ay + vy * plankWidth, footHeight + 0          ],
        [ ( bodyTopRadius    + plankDepth ) * ax + vx * plankWidth, ( bodyTopRadius    + plankDepth ) * ay + vy * plankWidth, footHeight + bodyHeight ],
        [ ( bodyTopRadius                 ) * ax + vx * plankWidth, ( bodyTopRadius                 ) * ay + vy * plankWidth, footHeight + bodyHeight ],
        [ ( bodyBottomRadius              ) * ax + vx * plankWidth, ( bodyBottomRadius              ) * ay + vy * plankWidth, footHeight + 0          ],
      ],

      // prettier-ignore
      [
        [ roofRadius * plankCapWidth / roofHeight * ax, roofRadius * plankCapWidth / roofHeight * ay, footHeight + bodyHeight + plankDepth + roofHeight - plankCapWidth],
        [ 0, 0, footHeight + bodyHeight + plankDepth + roofHeight],
        [ roofRadius * plankCapWidth / roofHeight * bx, roofRadius * plankCapWidth / roofHeight * by, footHeight + bodyHeight + plankDepth + roofHeight - plankCapWidth],
      ],

      // prettier-ignore
      [
        [ roofRadius * plankCapWidth / roofHeight * ax, roofRadius * plankCapWidth / roofHeight * ay, footHeight + bodyHeight + roofHeight - plankCapWidth + plankDepth],
        [ roofRadius * plankCapWidth / roofHeight * bx, roofRadius * plankCapWidth / roofHeight * by, footHeight + bodyHeight + roofHeight - plankCapWidth + plankDepth],
        [ roofRadius * plankCapWidth / roofHeight * bx, roofRadius * plankCapWidth / roofHeight * by, footHeight + bodyHeight + roofHeight - plankCapWidth             ],
        [ roofRadius * plankCapWidth / roofHeight * ax, roofRadius * plankCapWidth / roofHeight * ay, footHeight + bodyHeight + roofHeight - plankCapWidth             ],
      ],
    ]) {
      basicStatic.pushFlatFace(
        face.map((v: any) => vec3.transformMat4([] as any, v, transform)),
        windmillPlankColor
      );
    }
  }

  const update = () => {
    for (let k = 4; k--; )
      for (const face of [
        // prettier-ignore
        [
          [ wingXm +  wingBottomH, wingDepth, wingMarginO + 0    ],
          [ wingXm + -wingBottomH, wingDepth, wingMarginO + 0    ],
          [ wingXm + -wingTopH   , wingDepth, wingMarginO + wingL],
          [ wingXm +  wingTopH   , wingDepth, wingMarginO + wingL],
        ],

        // prettier-ignore
        [
          [ wingXm +  wingBottomH, -wingDepth, wingMarginO + 0    ],
          [ wingXm +  wingTopH   , -wingDepth, wingMarginO + wingL],
          [ wingXm + -wingTopH   , -wingDepth, wingMarginO + wingL],
          [ wingXm + -wingBottomH, -wingDepth, wingMarginO + 0    ],
        ],

        // prettier-ignore
        [
          [ wingXm + wingTopH   ,  wingDepth, wingMarginO + wingL],
          [ wingXm + wingTopH   , -wingDepth, wingMarginO + wingL],
          [ wingXm + wingBottomH, -wingDepth, wingMarginO + 0    ],
          [ wingXm + wingBottomH,  wingDepth, wingMarginO + 0    ],
        ],

        // prettier-ignore
        [
          [ wingXm + -wingTopH   , -wingDepth, wingMarginO + wingL],
          [ wingXm + -wingTopH   ,  wingDepth, wingMarginO + wingL],
          [ wingXm + -wingBottomH,  wingDepth, wingMarginO + 0    ],
          [ wingXm + -wingBottomH, -wingDepth, wingMarginO + 0    ],
        ],

        // prettier-ignore
        [
          [ wingXm +  wingTopH,  wingDepth, wingMarginO + wingL],
          [ wingXm + -wingTopH,  wingDepth, wingMarginO + wingL],
          [ wingXm + -wingTopH, -wingDepth, wingMarginO + wingL],
          [ wingXm +  wingTopH, -wingDepth, wingMarginO + wingL],
        ],

        // prettier-ignore
        [
          [ wingXm +  wingBottomH,  wingDepth, wingMarginO],
          [ wingXm +  wingBottomH, -wingDepth, wingMarginO],
          [ wingXm + -wingBottomH, -wingDepth, wingMarginO],
          [ wingXm + -wingBottomH,  wingDepth, wingMarginO],
        ],
      ]) {
        basicDynamic.pushFlatFace(
          face.map((v: any) => {
            const p: vec3 = [] as any;

            vec3.add(v, v, wingO);
            vec3.rotateZ(v, v, wingO, -0.16);
            vec3.rotateY(
              v,
              v,
              wingO,
              9 + (k * Math.PI) / 2 + date * 0.2 * Math.PI * 2
            );

            vec3.transformMat4(p, v, transform);

            return p;
          }),
          windmillWingColor
        );
      }
  };

  return update;
};
