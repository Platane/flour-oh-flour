import { gl } from "../../canvas";

export const maxIndex = 28 * 1000;

export const gIndexBuffer = gl.createBuffer();
export const gIndexes = new Uint16Array(maxIndex * 3).map((_, i) => i);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, gIndexes, gl.STATIC_DRAW);
