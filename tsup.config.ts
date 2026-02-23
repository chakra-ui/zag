import { esbuildPluginFilePathExtensions } from "esbuild-plugin-file-path-extensions"
import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/**/*.ts", "src/**/*.tsx"],
  target: "es2020",
  format: ["esm", "cjs"],
  bundle: true,
  esbuildPlugins: [esbuildPluginFilePathExtensions()],
})
