import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  target: "es2019",
  format: ["esm", "cjs"],
  replaceNodeEnv: true,
  define: {
    "import.meta.env": JSON.stringify({ MODE: "production" }),
  },
})
