import { defineConfig } from "vite"
import preact from "@preact/preset-vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    port: Number(process.env.PORT) || 3004,
    strictPort: true,
  },
})
