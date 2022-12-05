import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import path from "path"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@zag-js\/(.*)$/,
        replacement: path.resolve("./node_modules/@zag-js/$1/src"),
      },
    ],
  },
  plugins: [vue(), vueJsx()],
})
