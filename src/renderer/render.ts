import { gl } from "../canvas";
import { draw as drawCube } from "./meshes/cube";
import { draw as drawTerrain } from "./meshes/terrain";
import { draw as drawWindmill } from "./meshes/windmill";

gl.clearColor(0, 0, 0, 0);
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LESS);

// gl.enable(gl.BLEND);
// gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

export const render = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  drawCube();
  drawTerrain();
  drawWindmill();
};
