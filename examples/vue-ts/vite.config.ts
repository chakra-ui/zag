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
  optimizeDeps: {
    include: [
      "tiny-guard",
      "valtio",
      "merge-anything",
      "tiny-fn",
      "tiny-dom-event",
      "tiny-dom-query",
      "tiny-dom-query/attributes",
      "tiny-dom-query/focusable",
      "tiny-point/dom",
      "tiny-point/within",
      "tiny-rect",
      "tiny-rect/from-element",
      "tiny-rect/operations",
      "tiny-num",
      "valtio/vanilla",
      "klona",
      "valtio/utils",
      "scroll-into-view-if-needed",
      "tiny-dom-query/tabbable",
      "tiny-array",
      "tiny-point/distance",
      "tiny-nodelist",
      "@vue/runtime-core",
    ],
  },
  resolve: {
    alias: {
      "@ui-machines/vue": `${path.resolve(__dirname, "../../packages/core/vue/src/index.ts")}`,
      "@ui-machines/core": `${path.resolve(__dirname, "../../packages/core/vanilla")}`,
      "@ui-machines/web": `${path.resolve(__dirname, "../../packages/machines/src/index.ts")}`,
    },
  },
  plugins: [
    Vue(),
    Pages({
      pagesDir: "src/pages",
      extensions: ["vue", "ts", "tsx"],
    }),
    Components({
      extensions: ["tsx", "vue", "ts"],
      dirs: ["./src/components"],
    }),
  ],
})
