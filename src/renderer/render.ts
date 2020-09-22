import { gl } from "../canvas";
// import "./meshes/cursor";
import "./meshes/particles";
import "./meshes/terrain";
import "./meshes/windmill";
import "./meshes/field";
import "./meshes/flourStack";

import { basicDynamic, basicStatic } from "./materials";
import { dynamicUpdates } from "./shared";

gl.clearColor(0, 0, 0, 0);
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LESS);

export const render = () => {
  // reset dynamic buffers
  basicDynamic.reset();

  // update
  for (const u of dynamicUpdates) u();

  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // draw
  basicStatic.draw();
  basicDynamic.draw();
};
