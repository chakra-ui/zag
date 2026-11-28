import { fileURLToPath } from "node:url"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: "2025-01-07",
  devServer: {
    port: Number(process.env.PORT) || 3001,
  },
  alias: {
    "@styles": fileURLToPath(new URL("../styles", import.meta.url)),
  },
  // Match the repo's compiler options, so `typecheck` reports the same errors as the packages' own builds
  typescript: {
    tsConfig: {
      compilerOptions: { noUncheckedIndexedAccess: false, noImplicitOverride: false },
    },
  },
  vite: {
    optimizeDeps: {
      include: ["@internationalized/date"],
    },
  },
})
