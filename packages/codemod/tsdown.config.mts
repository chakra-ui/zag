import { defineConfig } from "tsdown"

// The CLI ships as two self-contained entries, not one file per source file.
export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["esm", "cjs"],
  target: "node18",
  platform: "node",
  clean: true,
  dts: true,
  outExtensions: ({ format }) => (format === "es" ? { js: ".mjs", dts: ".d.mts" } : { js: ".js", dts: ".d.ts" }),
})
