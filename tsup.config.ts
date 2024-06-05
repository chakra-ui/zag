import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  target: "es2020",
  sourcemap: true,
  format: ["esm", "cjs"],
})
