import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    retry: 2,
    globals: true,
    environment: "jsdom",
    css: false,
    setupFiles: "./vitest.setup.ts",
  },
})
