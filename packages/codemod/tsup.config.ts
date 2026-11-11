import { defineConfig } from "tsup"

// The shared config keeps relative imports unbundled, one file per source file.
// The CLI ships as two self-contained entries instead.
export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts", "src/cli.ts"],
  target: "node18",
  platform: "node",
  format: ["esm", "cjs"],
  bundle: true,
})
