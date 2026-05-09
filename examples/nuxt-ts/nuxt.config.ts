import { fileURLToPath } from "node:url"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: "2025-01-07",
  alias: {
    "@styles": fileURLToPath(new URL("../styles", import.meta.url)),
  },
  vite: {
    optimizeDeps: {
      include: ["@internationalized/date"],
    },
  },
})
