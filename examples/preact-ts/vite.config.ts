import preact from "@preact/preset-vite"
import { existsSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import type { Plugin } from "vite"
import { defineConfig } from "vite"

// Absolute, so workspace packages outside this folder resolve them too
const preactDir = dirname(createRequire(import.meta.url).resolve("preact/package.json"))

// Serve `/a/b/index.html` for `/a/b` like a static host; preview falls back to the root page
function prerenderedPages(): Plugin {
  return {
    name: "prerendered-pages",
    configurePreviewServer(server) {
      const outDir = join(server.config.root, server.config.build.outDir)
      server.middlewares.use((req, _res, next) => {
        const [path, query = ""] = (req.url ?? "/").split("?")
        if (!path.includes(".") && existsSync(join(outDir, path, "index.html"))) {
          req.url = `${path.replace(/\/?$/, "/")}index.html${query ? `?${query}` : ""}`
        }
        next()
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact({ reactAliasesEnabled: false, prerender: { enabled: true, renderTarget: "#app" } }),
    prerenderedPages(),
  ],
  resolve: {
    alias: [
      { find: "@styles", replacement: fileURLToPath(new URL("../styles", import.meta.url)) },
      { find: /^preact\/jsx-dev-runtime$/, replacement: `${preactDir}/jsx-runtime` },
      { find: /^preact(\/.*)?$/, replacement: `${preactDir}$1` },
      { find: /^react\/jsx-runtime$/, replacement: `${preactDir}/jsx-runtime` },
      { find: /^react\/jsx-dev-runtime$/, replacement: `${preactDir}/jsx-runtime` },
      { find: /^react-dom\/client$/, replacement: `${preactDir}/compat/client` },
      { find: /^react(-dom)?$/, replacement: `${preactDir}/compat` },
    ],
  },
  server: {
    port: Number(process.env.PORT) || 3004,
    strictPort: true,
  },
})
