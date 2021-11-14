import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import { resolve } from "path"

export default defineConfig({
  plugins: [solidPlugin() as any],
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
  resolve: {
    alias: {
      "@ui-machines/vue": `${resolve(__dirname, "../../packages/frameworks/vue/src")}`,
      "@ui-machines/core": `${resolve(__dirname, "../../packages/core/src")}`,
      "@ui-machines/web": `${resolve(__dirname, "../../packages/machines/src")}`,
    },
  },
})
