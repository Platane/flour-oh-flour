import { mat3, mat4, vec3 } from "gl-matrix";

export const cameraOrigin: vec3 = [] as any;

export const worldMatrix: mat4 = new Float32Array(4 * 4);
export const worldMatrixInv: mat4 = new Float32Array(4 * 4);
export const lookAtMatrix3Inv: mat3 = new Float32Array(3 * 3);

export const dynamicUpdates: (() => void)[] = [];
