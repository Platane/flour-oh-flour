import { gl } from "../canvas";
import {
  vertices as dynamicVertices,
  normals as dynamicNormals,
  colors as dynamicColors,
  n as dynamicN,
  resetN as dynamicResetN,
} from "./globalBuffers/dynamic";
import {
  vertices as staticVertices,
  normals as staticNormals,
  colors as staticColors,
  n as staticN,
} from "./globalBuffers/static";
import { update as updateParticles } from "./meshes/particles";
import { update as updateTerrain } from "./meshes/terrain";
import { createMaterial } from "./materials";

const staticMaterial = createMaterial(gl.STATIC_DRAW);
const dynamicMaterial = createMaterial(gl.DYNAMIC_DRAW);

staticMaterial.updateGeometry(
  staticColors,
  staticVertices,
  staticNormals,
  staticN * 3
);

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
  // update dynamic buffers
  dynamicResetN();

  // update
  updateParticles();
  updateTerrain();

  dynamicMaterial.updateGeometry(
    dynamicColors,
    dynamicVertices,
    dynamicNormals,
    dynamicN * 3
  );

  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // draw
  staticMaterial.draw();
  dynamicMaterial.draw();
};
