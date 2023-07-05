/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig(() => {
  const pkg = require(process.cwd() + "/package.json")

  return {
    plugins: [
      dts({
        skipDiagnostics: false,
        entryRoot: "src",
        staticImport: true,
        rollupTypes: false,
        logLevel: "info",
      }),
    ],
    build: {
      target: "esnext",
      minify: false,
      lib: {
        entry: "src/index.ts",
        formats: ["es", "cjs"],
        fileName: (format) => (format === "es" ? "index.mjs" : "index.js"),
      },
      rollupOptions: {
        external: [
          ...Object.keys(pkg.dependencies ?? {}),
          ...Object.keys(pkg.peerDependencies ?? {}),
          "react/jsx-runtime",
          "solid-js",
          "solid-js/web",
          "solid-js/store",
          "vue",
        ],
        output: [
          {
            format: "cjs",
            preserveModules: true,
            preserveModulesRoot: "src",
            exports: "named",
            entryFileNames: "[name].js",
          },
          {
            format: "es",
            preserveModules: true,
            preserveModulesRoot: "src",
            exports: "named",
            entryFileNames: "[name].mjs",
          },
        ],
      },
    },
    test: {
      globals: true,
    },
  }
})
