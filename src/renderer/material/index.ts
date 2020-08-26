import { createProgram } from "../util/program";
import codeFrag from "./shader.frag";
import codeVert from "./shader.vert";
import { gl } from "../../canvas";

createProgram(gl, codeVert, codeFrag);
