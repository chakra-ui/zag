import preact from "@preact/preset-vite"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import type { Plugin } from "vite"
import { defineConfig } from "vite"

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
    alias: {
      "@styles": fileURLToPath(new URL("../styles", import.meta.url)),
    },
    // workspace packages compiled from source don't depend on preact themselves
    dedupe: ["preact"],
  },
  server: {
    port: Number(process.env.PORT) || 3004,
    strictPort: true,
  },
})
