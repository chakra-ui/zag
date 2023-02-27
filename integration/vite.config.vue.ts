import { defineConfig } from "vite"
import sharedConfig from "./vite.config.shared"
import Vue from "@vitejs/plugin-vue"
import VueJsx from "@vitejs/plugin-vue-jsx"

export default defineConfig({
  ...sharedConfig,
  resolve: {
    alias: [{ find: /^(.*)\.setup$/, replacement: "$1.setup.vue.tsx" }],
  },
  plugins: [Vue(), VueJsx()],
})
