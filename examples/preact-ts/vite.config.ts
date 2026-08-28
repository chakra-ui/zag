import { defineConfig } from "vite"
import preact from "@preact/preset-vite"
import { fileURLToPath } from "node:url"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      "@styles": fileURLToPath(new URL("../styles", import.meta.url)),
    },
  },
  server: {
    port: Number(process.env.PORT) || 3004,
    strictPort: true,
  },
})
