import { mat4 } from "gl-matrix";
import { triangles } from "../../generation/terrain/mesh";
import { dirtColor, hillColor } from "../colors";
import { basicStatic } from "../materials";

for (const { vertices, normal, cellIndex } of triangles) {
  const color = cellIndex === null ? hillColor : dirtColor;
  basicStatic.pushFace(vertices, color, normal);
}
