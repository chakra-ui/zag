import { defineConfig } from "vite"
import path from "path"
import Vue from "@vitejs/plugin-vue"
import Pages from "vite-plugin-pages"
import Components from "vite-plugin-components"

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
  resolve: {
    alias: {
      "@ui-machines/vue": `${path.resolve(
        __dirname,
        "../../packages/machine/src/vue/index.ts",
      )}`,
      "@chakra-ui/utilities": `${path.resolve(
        __dirname,
        "../../packages/utilities/src",
      )}`,
      "@ui-machines/core": `${path.resolve(
        __dirname,
        "../../packages/ui-machines/src",
      )}`,
    },
  },
  plugins: [
    Vue(),
    Pages({
      pagesDir: "src/pages",
      extensions: ["vue", "ts", "tsx"],
    }),
    Components(),
  ],
})
