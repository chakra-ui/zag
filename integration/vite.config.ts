import { defineConfig } from "vite"
import React from "@vitejs/plugin-react"

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.integration.ts"],
    setupFiles: ["./setup.ts"],
  },
  plugins: [
    React({
      // Needed to disable HMR for tests
      // @see https://github.com/vitejs/vite/issues/9362
      include: "**/*.disabled",
    }),
  ],
})
