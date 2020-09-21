import { triangles } from "../../generation/terrain/mesh";
import { dirtColor, hillColor } from "../colors";
import { basicStatic } from "../materials";

for (const { vertices, normal, cellIndex } of triangles) {
  const color = cellIndex ? dirtColor : hillColor;
  basicStatic.pushFace(vertices, color, normal);
}
