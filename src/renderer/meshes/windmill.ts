import { vec3, mat3 } from "gl-matrix";
import { getFlatShadingNormals } from "../utils/flatShading";
import { createMaterial } from "../materials";

export const createWindmill = () => {
  const bodyTopRadius = 1;
  const bodyBottomRadius = 1.25;
  const bodyHeight = 1.8;

  const footTopRadius = 0.5;
  const footBottomRadius = 0.95;
  const footHeight = 0.6;

  const roofRadius = 1.2;
  const roofHeight = 0.8;
  const roofTip = 0.13;

  const faces: { vertices: vec3[]; color: number[] }[] = [];

  const n = 5;
  for (let i = 0; i < n; i++) {
    let a = (i * Math.PI * 2) / n;
    let b = ((i + 1) * Math.PI * 2) / n;

    const ax = Math.sin(a);
    const bx = Math.sin(b);
    const ay = Math.cos(a);
    const by = Math.cos(b);

    for (const vertices of [
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
        [ roofRadius * ax, footHeight + bodyHeight - roofTip             , roofRadius * ay],
        [ roofRadius * bx, footHeight + bodyHeight - roofTip             , roofRadius * by],
        [ 0              , footHeight + bodyHeight - roofTip + roofHeight, 0              ],
      ],

      // prettier-ignore
      [
        [ 0                    , footHeight * 0.2 + 0   , 0                    ],
        [ bodyBottomRadius * bx, footHeight + 0         , bodyBottomRadius * by],
        [ bodyBottomRadius * ax, footHeight + 0         , bodyBottomRadius * ay],
      ],
    ])
      faces.push({
        // @ts-ignore
        vertices,
        color: [0.4, 0.42, 0.46],
      });
  }

  const wingO: vec3 = [0, 2.16, -1.02];
  const wingL = 1.9;
  const wingMarginO = 0.1;
  const wingTopH = 0.4;
  const wingBottomH = 0.1;
  const wingDepth = 0.035;
  const wingXm = 0.04;

  for (let k = 4; k--; )
    for (const vertices of [
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
    ])
      faces.push({
        // @ts-ignore
        vertices: vertices.map((v: any) =>
          vec3.rotateZ(v, vec3.add(v, v, wingO), wingO, 9 + (k * Math.PI) / 2)
        ),
        color: [0.4, 0.42, 0.46],
      });

  // const bodyL = 1;
  // const bodyH = 1.2;

  // const pL = 0.9;
  // const pH = 0.2;

  // const footL = 1;
  // const footH = 1.2;

  // const bodyColor = [0.4, 0.42, 0.46];

  // const plankL = 0.1;
  // const plankM = 0.03;

  // const plankColor = [0.51, 0.52, 0.56];

  // const rTop = 1;
  // const rBottom = 1.1;

  // faces.push(
  //   ...[
  //     // prettier-ignore
  //     [
  //       [ bodyL * 0.5 , 0           , bodyL * 0.5],
  //       [ bodyL * 0.5 , pH + bodyH  , bodyL * 0.5],
  //       [-bodyL * 0.5 , pH + bodyH  , bodyL * 0.5],
  //       [-bodyL * 0.5 , 0           , bodyL * 0.5],
  //     ],

  //     // prettier-ignore
  //     [
  //       [ bodyL * 0.5 , 0           , bodyL * 0.5],
  //       [ bodyL * 0.5 , pH + bodyH  , bodyL * 0.5],
  //       [-bodyL * 0.5 , pH + bodyH  , bodyL * 0.5],
  //       [-bodyL * 0.5 , 0           , bodyL * 0.5],
  //     ],
  //   ].map((vertices) => ({ vertices, color: bodyColor }))
  // );

  // const n = faces.length;

  // for (const a of [1, 2, 3]) {
  //   // for (const a of around4.slice(0, 1)) {

  //   for (let i = n; i--; )
  //     faces.push({
  //       color: faces[i].color,
  //       vertices: faces[i].vertices.map((v) =>
  //         vec3.rotateY([] as any, v, o, (a * Math.PI) / 2)
  //       ),
  //     });
  // }

  // const

  // for (const a of around4) {
  //   const u = [a[0], 0, a[1]];
  //   const v = vec3.cross([] as any, u as vec3, up);

  //   faces.push({
  //     color,
  //     vertices: [
  //       [  bodyL1*0.5    bodyH ]
  //     ],
  //   });
  // }

  return toBuffer(faces);
};

const toBuffer = (faces: { vertices: vec3[]; color: number[] }[]) => {
  const colors: number[][] = [];
  const vertices: vec3[] = [];

  for (const f of faces) {
    for (let i = 1; i < f.vertices.length - 1; i++) {
      vertices.push(f.vertices[0], f.vertices[i + 0], f.vertices[i + 1]);
      colors.push(f.color, f.color, f.color);
    }
  }

  const fColors = Float32Array.from(colors.flat());
  const fVertices = Float32Array.from((vertices as number[][]).flat());
  const fIndices = Uint16Array.from(
    { length: fVertices.length / 3 },
    (_, i) => i
  );
  const fNormals = getFlatShadingNormals(fIndices, fVertices);

  return {
    vertices: fVertices,
    normals: fNormals,
    indexes: fIndices,
    colors: fColors,
  };
};

const m = createMaterial();

const wm = createWindmill();

m.updateGeometry(wm.indexes, wm.colors, wm.vertices, wm.normals);

export const draw = m.draw;
