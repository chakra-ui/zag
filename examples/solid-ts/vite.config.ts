import { defineConfig } from "vite"
import solid from "vite-plugin-solid"
import path from "path"

export default defineConfig({
  plugins: [solid()],
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
  resolve: {
    alias: [
      {
        find: /^@zag-js\/(.*)$/,
        replacement: path.resolve("./node_modules/@zag-js/$1/src"),
      },
    ],
  },
})
