import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import stdLibBrowser from "node-stdlib-browser";
import { handleCircularDependancyWarning } from "node-stdlib-browser/helpers/rollup/plugin";
import alias from "@rollup/plugin-alias";
import inject from "@rollup/plugin-inject";
import { defineConfig } from "rollup";
import * as fs from "fs";
import path from "path";

export default defineConfig({
  input: "build/index.js",
  output: {
    file: "dist/index.js",
    format: "iife",
    inlineDynamicImports: true,
    banner: fs.readFileSync(
      path.resolve("node_modules/setimmediate/setImmediate.js")
    ),
  },
  plugins: [
    json(),
    alias({
      entries: stdLibBrowser,
    }),
    resolve({ browser: true, preferBuiltins: true, dedupe: ["libkmodule"] }),
    commonjs({ transformMixedEsModules: true }),
    inject({
      process: stdLibBrowser.process,
      Buffer: [stdLibBrowser.buffer, "Buffer"],
    }),
  ],
  onwarn: (warning, rollupWarn) => {
    handleCircularDependancyWarning(warning, rollupWarn);
  },
});
