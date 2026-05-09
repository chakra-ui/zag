import { defineConfig } from "vite"
import { fileURLToPath } from "node:url"

export default defineConfig({
  resolve: {
    alias: {
      "@styles": fileURLToPath(new URL("../styles", import.meta.url)),
    },
  },
})
