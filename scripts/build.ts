import * as fs from "fs";
import * as path from "path";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { rollup, InputOptions, RollupOptions } from "rollup";
import { minify as minifyHtml } from "html-minifier-terser";
import { minify, MinifyOptions } from "terser";
import compiler from "@ampproject/rollup-plugin-closure-compiler";
import mkdirp from "mkdirp";

// @ts-ignore
import babelPluginDefine from "babel-plugin-transform-define";

// @ts-ignore
import babelPresetTypescript from "@babel/preset-typescript";

import { glsl } from "./rollup-plugin-glsl";

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
  useShortDoctype: true,
  minifyCSS: true,
};

export const createRollupInputOptions = (production: boolean) =>
  ({
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
        plugins: [
          [
            babelPluginDefine,
            { "process.env.NODE_ENV": production ? "production" : "dev" },
          ],
        ],
      }),

      glsl({
        include: ["**/*.frag", "**/*.vert"],
        compress: production,
      }),

      ...(production ? [compiler()] : []),
    ],
  } as InputOptions);

export const rollupOutputOptions: RollupOptions = {
  output: {
    format: "es",
    sourcemap: false,
  },
};

const propertiesToMangle = [
  //
  "updateGeometry",

  "circle",
  "center",
  "radiusSquared",

  "vertices",
  "indexes",
  "faces",
  "normals",
  "colors",
  "color",
];

export const build = async () => {
  // bundle with rollup
  const bundle = await rollup(createRollupInputOptions(true));
  let {
    output: [{ code }],
  } = await bundle.generate(rollupOutputOptions);

  // replace gl var names ( uniform / attribute / varying )
  {
    const glVarNames = [
      ...Array.from(code.matchAll(/(attribute|uniform) \w+ (\w+);/g)).map(
        ([_, __, name]) => name
      ),
      ...Array.from(code.matchAll(/varying \w+ \w+ (\w+);/g)).map(
        ([_, name]) => name
      ),
    ];

    code = code.replace(
      new RegExp("(" + glVarNames.join("|") + ")", "g"),
      (name) => (glVarNames.indexOf(name) + 10).toString(36)
    );
  }

  // minify with terser
  {
    const out = await minify(code, terserOptions);
    code = out.code!;
  }

  // replace own properties name
  code = code.replace(
    new RegExp(`[{\,\.}](` + propertiesToMangle.join("|") + `)[^\w]`, "g"),
    (x, term) =>
      x.replace(term, (propertiesToMangle.indexOf(term) + 10).toString(36))
  );

  const htmlContent = fs
    .readFileSync(path.resolve(__dirname, "..", "src", "index.html"))
    .toString();

  const minifiedHtmlContent = minifyHtml(
    htmlContent.replace(
      '<script src="../dist/bundle.js"></script>',
      `<script>${code!}</script>`
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
