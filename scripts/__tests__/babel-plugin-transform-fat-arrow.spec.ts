import { transformSync } from "@babel/core";
import babelPluginFatArrow from "../babel-plugin-transform-fat-arrow";

test.each([
  //
  [`var a=()=>{0;};`, `var a=()=>{0;};`],
  [`var a=()=>{0;};`, `var a=()=>{0;};`],
  [`o.a.b=function(){0;}`, `o.a.b=()=>{0;};`],
  [`function a(){0;}`, `var a=()=>{0;};`],
  [`var a={a:function a(){0;}}`, `var a={a:()=>{0;}};`],
  [`function a(){0;this.a=0;}`, `function a(){0;this.a=0;}`],
  [`function a(){arguments[0]}`, `function a(){arguments[0];}`],
])(`should transform "%s" -> "%s"`, (input, output) => {
  const { code } = transformSync(input, {
    compact: true,
    plugins: [babelPluginFatArrow],
  })!;

  expect(code).toBe(output);
});
