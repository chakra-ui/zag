import { defineConfig } from "@solidjs/start/config"
import { fileURLToPath } from "node:url"

export default defineConfig({
  server: { preset: "vercel" },
  vite: {
    resolve: {
      alias: {
        "@styles": fileURLToPath(new URL("../styles", import.meta.url)),
      },
    },
  },
})
