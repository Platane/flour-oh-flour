const { minify } = require("html-minifier-terser");
const fs = require("fs");
const path = require("path");

const scriptContent = fs
  .readFileSync(path.resolve(__dirname, "..", "dist", "bundle.js"))
  .toString();

const indexContent = fs
  .readFileSync(path.resolve(__dirname, "..", "src", "index.html"))
  .toString();

const minifiedIndexContent = minify(
  indexContent.replace(
    '<script src="../dist/bundle.js"></script>',
    `<script>${scriptContent}</script>`
  ),
  {
    collapseWhitespace: true,
  }
);

fs.writeFileSync(
  path.resolve(__dirname, "..", "dist", "index.html"),
  minifiedIndexContent
);
