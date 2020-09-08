import { vec3 } from "gl-matrix";
import { faceToVertices } from "../utils/faceToVertices";

export const createWindmill = () => {
  const vertices: number[] = [];
  const colors: number[] = [];

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
  const wingO: vec3 = [0, 2.16, -1.17];
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
        [ bodyBottomRadius * ax, footHeight + 0         , bodyBottomRadius * ay],
        [ bodyBottomRadius * bx, footHeight + 0         , bodyBottomRadius * by],
        [ bodyTopRadius    * bx, footHeight + bodyHeight, bodyTopRadius    * by],
        [ bodyTopRadius    * ax, footHeight + bodyHeight, bodyTopRadius    * ay],
      ],

      // prettier-ignore
      [
        [ footBottomRadius * ax, 0               , footBottomRadius * ay],
        [ footBottomRadius * bx, 0               , footBottomRadius * by],
        [ footTopRadius    * bx, footHeight * 1.1, footTopRadius    * by],
        [ footTopRadius    * ax, footHeight * 1.1, footTopRadius    * ay],
      ],

      // prettier-ignore
      [
        [ footBottomRadius * bx,  0                  , footBottomRadius * by],
        [ footBottomRadius * ax,  0                  , footBottomRadius * ay],
        [ footBottomRadius * ax, -baseExtensionHeight, footBottomRadius * ay],
        [ footBottomRadius * bx, -baseExtensionHeight, footBottomRadius * by],
      ],

      // prettier-ignore
      [
        [ roofRadius * ax, footHeight + bodyHeight             , roofRadius * ay],
        [ roofRadius * bx, footHeight + bodyHeight             , roofRadius * by],
        [ 0              , footHeight + bodyHeight + roofHeight, 0              ],
      ],

      // prettier-ignore
      [
        [ 0                    , footHeight * 0.4, 0                    ],
        [ bodyBottomRadius * bx, footHeight      , bodyBottomRadius * by],
        [ bodyBottomRadius * ax, footHeight      , bodyBottomRadius * ay],
      ],

      // prettier-ignore
      [
        [ 0              , footHeight + bodyHeight, 0              ],
        [ roofRadius * bx, footHeight + bodyHeight, roofRadius * by],
        [ roofRadius * ax, footHeight + bodyHeight, roofRadius * ay],
      ],
    ]) {
      const vs = faceToVertices(face);
      vertices.push(...vs);

      for (let i = vs.length / 3; i--; )
        colors.push(142 / 255, 92 / 255, 31 / 255);
    }

    let vy = by - ay;
    let vx = bx - ax;
    const l = Math.sqrt(vx * vx + vy * vy);

    vy /= l;
    vx /= l;

    for (const face of [
      // prettier-ignore
      [
        [ ( bodyBottomRadius + plankDepth ) * ax + vx * plankWidth, footHeight + 0          , ( bodyBottomRadius + plankDepth ) * ay + vy * plankWidth],
        [ ( bodyTopRadius    + plankDepth ) * ax + vx * plankWidth, footHeight + bodyHeight , ( bodyTopRadius    + plankDepth ) * ay + vy * plankWidth],
        [ ( bodyTopRadius    + plankDepth ) * ax                  , footHeight + bodyHeight , ( bodyTopRadius    + plankDepth ) * ay                  ],
        [ ( bodyBottomRadius + plankDepth ) * ax                  , footHeight + 0          , ( bodyBottomRadius + plankDepth ) * ay                  ],
      ],

      // prettier-ignore
      [
        [ ( bodyTopRadius    + plankDepth ) * bx - vx * plankWidth, footHeight + bodyHeight , ( bodyTopRadius    + plankDepth ) * by - vy * plankWidth],
        [ ( bodyBottomRadius + plankDepth ) * bx - vx * plankWidth, footHeight + 0          , ( bodyBottomRadius + plankDepth ) * by - vy * plankWidth],
        [ ( bodyBottomRadius + plankDepth ) * bx                  , footHeight + 0          , ( bodyBottomRadius + plankDepth ) * by                  ],
        [ ( bodyTopRadius    + plankDepth ) * bx                  , footHeight + bodyHeight , ( bodyTopRadius    + plankDepth ) * by                  ],
      ],

      // prettier-ignore
      [
        [ ( bodyBottomRadius + plankDepth ) * bx - vx * plankWidth, footHeight + 0          , ( bodyBottomRadius + plankDepth ) * by - vy * plankWidth],
        [ ( bodyTopRadius    + plankDepth ) * bx - vx * plankWidth, footHeight + bodyHeight , ( bodyTopRadius    + plankDepth ) * by - vy * plankWidth],
        [ ( bodyTopRadius                 ) * bx - vx * plankWidth, footHeight + bodyHeight , ( bodyTopRadius                 ) * by - vy * plankWidth],
        [ ( bodyBottomRadius              ) * bx - vx * plankWidth, footHeight + 0          , ( bodyBottomRadius              ) * by - vy * plankWidth],
      ],

      // prettier-ignore
      [
        [ ( bodyTopRadius    + plankDepth ) * ax + vx * plankWidth, footHeight + bodyHeight , ( bodyTopRadius    + plankDepth ) * ay + vy * plankWidth],
        [ ( bodyBottomRadius + plankDepth ) * ax + vx * plankWidth, footHeight + 0          , ( bodyBottomRadius + plankDepth ) * ay + vy * plankWidth],
        [ ( bodyBottomRadius              ) * ax + vx * plankWidth, footHeight + 0          , ( bodyBottomRadius              ) * ay + vy * plankWidth],
        [ ( bodyTopRadius                 ) * ax + vx * plankWidth, footHeight + bodyHeight , ( bodyTopRadius                 ) * ay + vy * plankWidth],
      ],

      // prettier-ignore
      [
        [ ( bodyTopRadius    + plankDepth ) * ax + vx * plankWidth, footHeight + bodyHeight , ( bodyTopRadius    + plankDepth ) * ay + vy * plankWidth],
        [ ( bodyBottomRadius + plankDepth ) * ax + vx * plankWidth, footHeight + 0          , ( bodyBottomRadius + plankDepth ) * ay + vy * plankWidth],
        [ ( bodyBottomRadius              ) * ax + vx * plankWidth, footHeight + 0          , ( bodyBottomRadius              ) * ay + vy * plankWidth],
        [ ( bodyTopRadius                 ) * ax + vx * plankWidth, footHeight + bodyHeight , ( bodyTopRadius                 ) * ay + vy * plankWidth],
      ],

      // prettier-ignore
      [
        [ 0, footHeight + bodyHeight + plankDepth + roofHeight, 0],
        [ roofRadius * plankCapWidth / roofHeight * ax, footHeight + bodyHeight + plankDepth + roofHeight - plankCapWidth, roofRadius * plankCapWidth / roofHeight * ay],
        [ roofRadius * plankCapWidth / roofHeight * bx, footHeight + bodyHeight + plankDepth + roofHeight - plankCapWidth, roofRadius * plankCapWidth / roofHeight * by],
      ],

      // prettier-ignore
      [
        [ roofRadius * plankCapWidth / roofHeight * bx, footHeight + bodyHeight + roofHeight - plankCapWidth + plankDepth, roofRadius * plankCapWidth / roofHeight * by],
        [ roofRadius * plankCapWidth / roofHeight * ax, footHeight + bodyHeight + roofHeight - plankCapWidth + plankDepth, roofRadius * plankCapWidth / roofHeight * ay],
        [ roofRadius * plankCapWidth / roofHeight * ax, footHeight + bodyHeight + roofHeight - plankCapWidth             , roofRadius * plankCapWidth / roofHeight * ay],
        [ roofRadius * plankCapWidth / roofHeight * bx, footHeight + bodyHeight + roofHeight - plankCapWidth             , roofRadius * plankCapWidth / roofHeight * by],
      ],
    ]) {
      const vs = faceToVertices(face);
      vertices.push(...vs);

      for (let i = vs.length / 3; i--; )
        colors.push(197 / 255, 136 / 255, 71 / 255);
    }
  }

  for (let k = 4; k--; )
    for (const face of [
      // prettier-ignore
      [
        [ wingXm + -wingBottomH, wingMarginO + 0    , wingDepth],
        [ wingXm +  wingBottomH, wingMarginO + 0    , wingDepth],
        [ wingXm +  wingTopH   , wingMarginO + wingL, wingDepth],
        [ wingXm + -wingTopH   , wingMarginO + wingL, wingDepth],
      ],

      // prettier-ignore
      [
        [ wingXm +  wingTopH   , wingMarginO + wingL, -wingDepth],
        [ wingXm +  wingBottomH, wingMarginO + 0    , -wingDepth],
        [ wingXm + -wingBottomH, wingMarginO + 0    , -wingDepth],
        [ wingXm + -wingTopH   , wingMarginO + wingL, -wingDepth],
      ],

      // prettier-ignore
      [
        [ wingXm + wingTopH   , wingMarginO + wingL, -wingDepth],
        [ wingXm + wingTopH   , wingMarginO + wingL,  wingDepth],
        [ wingXm + wingBottomH, wingMarginO + 0    ,  wingDepth],
        [ wingXm + wingBottomH, wingMarginO + 0    , -wingDepth],
      ],

      // prettier-ignore
      [
        [ wingXm + -wingTopH   , wingMarginO + wingL,  wingDepth],
        [ wingXm + -wingTopH   , wingMarginO + wingL, -wingDepth],
        [ wingXm + -wingBottomH, wingMarginO + 0    , -wingDepth],
        [ wingXm + -wingBottomH, wingMarginO + 0    ,  wingDepth],
      ],

      // prettier-ignore
      [
        [ wingXm + -wingTopH, wingMarginO + wingL,  wingDepth],
        [ wingXm +  wingTopH, wingMarginO + wingL,  wingDepth],
        [ wingXm +  wingTopH, wingMarginO + wingL, -wingDepth],
        [ wingXm + -wingTopH, wingMarginO + wingL, -wingDepth],
      ],

      // prettier-ignore
      [
        [ wingXm +  wingBottomH, wingMarginO, -wingDepth],
        [ wingXm +  wingBottomH, wingMarginO,  wingDepth],
        [ wingXm + -wingBottomH, wingMarginO,  wingDepth],
        [ wingXm + -wingBottomH, wingMarginO, -wingDepth],
      ],
    ]) {
      const vs = faceToVertices(
        face.map((v: any) => {
          vec3.add(v, v, wingO);
          vec3.rotateY(v, v, wingO, -0.16);
          vec3.rotateZ(v, v, wingO, 9 + (k * Math.PI) / 2);

          return v;
        })
      );
      vertices.push(...vs);

      for (let i = vs.length / 3; i--; )
        colors.push(212 / 255, 198 / 255, 181 / 255);
    }

  return { vertices, colors };
};
