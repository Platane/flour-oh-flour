import * as fs from "fs";
import * as path from "path";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { rollup, InputOptions, RollupOptions } from "rollup";
import { minify as minifyHtml } from "html-minifier-terser";
import { minify, MinifyOptions } from "terser";
import mkdirp from "mkdirp";

// @ts-ignore
import babelPresetTypescript from "@babel/preset-typescript";

export const terserOptions: MinifyOptions = {
  compress: {
    keep_infinity: true,
    pure_getters: true,
    unsafe_arrows: true,
    passes: 10,
  },
  format: {
    wrap_func_args: false,
    comments: false,
  },
  ecma: 2019,
  toplevel: true,
  mangle: {},
};

export const minifyHtmlOptions = {
  collapseWhitespace: true,
};

export const rollupInputOptions: InputOptions = {
  input: path.resolve(__dirname, "..", "src", "index.ts"),

  plugins: [
    commonjs(),
    resolve({
      extensions: [".ts", ".js"],
    }),
    babel({
      babelHelpers: "bundled",
      babelrc: false,
      extensions: [".ts", ".js"],
      presets: [
        //
        babelPresetTypescript,
      ],
      plugins: [],
    }),
  ],
};
export const rollupOutputOptions: RollupOptions = {
  output: {
    format: "es",
    sourcemap: false,
  },
};

export const build = async () => {
  const bundle = await rollup(rollupInputOptions);

  const { output } = await bundle.generate(rollupOutputOptions);

  const { code: minifiedJs } = await minify(output[0].code, terserOptions);

  const htmlContent = fs
    .readFileSync(path.resolve(__dirname, "..", "src", "index.html"))
    .toString();

  const minifiedHtmlContent = minifyHtml(
    htmlContent.replace(
      '<script src="../dist/bundle.js"></script>',
      `<script>${minifiedJs}</script>`
    ),
    minifyHtmlOptions
  );

  fs.rmdirSync(path.resolve(__dirname, "..", "dist"), { recursive: true });
  mkdirp.sync(path.resolve(__dirname, "..", "dist"));

  fs.writeFileSync(
    path.resolve(__dirname, "..", "dist", "index.html"),
    minifiedHtmlContent
  );
};
