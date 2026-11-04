import solid from "@solidjs/vite-plugin"
import { fileURLToPath } from "node:url"
import type { Plugin } from "vite"
import { defineConfig } from "vite"
import { prefsScript } from "./src/components/shell/prefs"

const path = (p: string) => fileURLToPath(new URL(p, import.meta.url))

function prefs(): Plugin {
  return {
    name: "playground-prefs",
    transformIndexHtml: () => [{ tag: "script", children: prefsScript, injectTo: "head-prepend" }],
  }
}

export default defineConfig({
  plugins: [solid(), prefs()],
  resolve: {
    alias: {
      "~": path("./src"),
      "@styles": path("../styles"),
      // lucide-solid only supports Solid 1
      "lucide-solid": path("./src/lib/lucide.tsx"),
    },
  },
  server: {
    port: Number(process.env.PORT) || 3002,
    strictPort: true,
  },
})
