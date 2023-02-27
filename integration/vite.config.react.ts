import { defineConfig } from "vite"
import sharedConfig from "./vite.config.shared"
import React from "@vitejs/plugin-react"

export default defineConfig({
  ...sharedConfig,
  plugins: [
    React({
      // Needed to disable HMR for tests
      // @see https://github.com/vitejs/vite/issues/9362
      include: "**/*.disabled",
    }),
  ],
})
