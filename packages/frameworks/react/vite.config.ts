import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    retry: 2,
    globals: true,
    environment: "jsdom",
    css: false,
    setupFiles: "./vitest.setup.ts",
  },
})
