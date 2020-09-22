import { gl } from "../../canvas";
import { createBasicMaterial } from "./basic";

export const basicStatic = createBasicMaterial(gl.STATIC_DRAW);
export const basicDynamic = createBasicMaterial(gl.DYNAMIC_DRAW);
