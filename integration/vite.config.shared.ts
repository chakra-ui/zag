import { defineConfig } from "vite"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.integration.ts"],
    setupFiles: ["./setup.ts"],
  },
})
