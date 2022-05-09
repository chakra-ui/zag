import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"
import components from "vite-plugin-components"
import persist from "vite-plugin-optimize-persist"
import pkgConfig from "vite-plugin-package-config"
import pages from "vite-plugin-pages"

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
  },
  plugins: [
    vue(),
    pages({
      pagesDir: "src/pages",
      extensions: ["vue", "ts", "tsx"],
    }),
    components({
      extensions: ["tsx", "vue", "ts"],
      dirs: ["./src/components"],
    }),
    pkgConfig(),
    persist(),
  ],
})
