import { mat4 } from "gl-matrix";

export const worldMatrix = new Float32Array(4 * 4);

mat4.identity(worldMatrix);
