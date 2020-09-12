import { vec2 } from "gl-matrix";
import { epsilon } from "../constant";

export const getSegmentIntersection = (
  A1: vec2,
  A2: vec2,
  B1: vec2,
  B2: vec2
): number | null => {
  const A0x = A1[0];
  const A0y = A1[1];

  const B0x = B1[0];
  const B0y = B1[1];

  const vAx = A2[0] - A1[0];
  const vAy = A2[1] - A1[1];

  const vBx = B2[0] - B1[0];
  const vBy = B2[1] - B1[1];

  // colinear
  if (Math.abs(vAx * vBy - vAy * vBx) < epsilon) {
    return null;
  }

  // A0 + vA * k1  =  B0 + vB * k2

  // | A0x | + | vAx |           | B0x | + | vBx |
  // |     | + |     | * k1   =  |     | + |     | * k2
  // | A0y | + | vAy |           | B0y | + | vBy |

  // vB *  k2 = A0 - B0 + vA * k1

  let k1;
  if (Math.abs(vBx) < epsilon) k1 = (B0x - A0x) / vAx;
  else if (Math.abs(vBy) < epsilon) k1 = (B0y - A0y) / vAy;
  else k1 = ((A0x - B0x) / vBx - (A0y - B0y) / vBy) / (vAy / vBy - vAx / vBx);

  if (k1 >= 0 && k1 <= 1) return k1;

  return null;
};
