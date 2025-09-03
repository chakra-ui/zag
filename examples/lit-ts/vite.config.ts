import { defineConfig } from "vite"

export default defineConfig({
  server: {
    port: 3004,
  },
  build: {
    target: "esnext",
  },
})
