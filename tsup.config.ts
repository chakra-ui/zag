import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  target: "es2020",
  format: ["esm", "cjs"],
})
