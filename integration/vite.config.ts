import { defineConfig } from "vite"
import Vue from "@vitejs/plugin-vue"
import Jsx from "@vitejs/plugin-vue-jsx"

export default defineConfig({
  plugins: [Vue(), Jsx()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.integration.ts"],
    transformMode: {
      web: [/.[tj]sx$/],
    },
    setupFiles: ["./setup.ts"],
  },
})
