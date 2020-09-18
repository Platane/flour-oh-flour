import { gl } from "../canvas";
// import { update as updateParticles } from "./meshes/particles";
// import { update as updateTerrain } from "./meshes/terrain";
import { update as updateCursor } from "./meshes/cursor";

import "./meshes/terrain";

import { basicDynamic, basicStatic } from "./materials";

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
  // updateParticles();
  // updateTerrain();
  updateCursor();

  // basicDynamic.pushFlatFace(
  //   [
  //     //
  //     [-0.5, -0.5, 0],
  //     [0.5, -0.5, 0],
  //     [0, 0.5, 0],
  //   ],
  //   [0.9, 1, 0.3]
  // );

  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // draw
  basicStatic.draw();
  basicDynamic.draw();
};
