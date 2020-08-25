import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import { watch, RollupWatchOptions } from "rollup";
import { rollupInputOptions, rollupOutputOptions } from "./build";

const rollupWatchOptions: RollupWatchOptions = {
  ...rollupInputOptions,
  output: {
    format: "es",
    sourcemap: true,
    file: path.resolve(__dirname, "..", "dist", "bundle.js"),
  },
};

export const dev = async () => {
  const watcher = await watch([rollupWatchOptions]);

  let resolve: null | (() => void);
  let reject: null | ((error: any) => void);
  let promise = Promise.resolve();

  watcher.on("event", (event) => {
    switch (event.code) {
      case "ERROR":
        console.error(event.error);
        if (reject) reject(event.error);
        break;
      case "BUNDLE_START":
        promise = new Promise((r, s) => {
          resolve = r;
          reject = s;
        });
        break;
      case "BUNDLE_END":
        if (resolve) resolve();
        break;
    }
  });

  const server = http.createServer(async (req, res) => {
    try {
      let filePath;

      if (req.url === "/") {
        filePath = path.resolve(__dirname, "..", "src", "index.html");
      } else {
        await promise;
        filePath = path.resolve(
          __dirname,
          "..",
          "dist",
          req.url!.split("/dist/")[1]
        );
      }

      res.end(fs.readFileSync(filePath));
    } catch (error) {
      res.writeHead(500);
      res.end();
    }
  });

  const close = () => {
    server.close();
    watcher.close();
  };

  const port = process.env.PORT || 3000;

  server.listen(port, () => console.log(`http://localhost:3000`));

  return { close };
};
