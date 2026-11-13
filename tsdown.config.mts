import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/**/*.ts", "src/**/*.tsx"],
  format: ["esm", "cjs"],
  target: "es2020",
  unbundle: true,
  clean: true,
  dts: true,
  // Match the previous published layout: .mjs/.d.mts for ESM, .js/.d.ts for CJS
  outExtensions: ({ format }) => (format === "es" ? { js: ".mjs", dts: ".d.mts" } : { js: ".js", dts: ".d.ts" }),
  outputOptions: { esModule: true, exports: "named" },
})
