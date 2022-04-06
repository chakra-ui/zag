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
      "@zag-js/vue": `${resolve(__dirname, "../../packages/frameworks/vue/src")}`,
      "@zag-js/core": `${resolve(__dirname, "../../packages/core/src")}`,
      "@zag-js/web": `${resolve(__dirname, "../../packages/machines/src")}`,
    },
  },
})
