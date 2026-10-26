import adapter from "@sveltejs/adapter-auto"
import { sveltekit } from "@sveltejs/kit/vite"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { existsSync, readFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { defineConfig } from "vite"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load package mappings
let packageMap = {}
const packageMapPath = resolve(__dirname, "package-map.json")
if (existsSync(packageMapPath)) {
  packageMap = JSON.parse(readFileSync(packageMapPath, "utf8"))
} else {
  console.warn("⚠️  package-map.json not found. Run: node package-map.mjs")
}

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter(),
      alias: { $lib: "src/lib", ...packageMap },
      preprocess: vitePreprocess(),
      compilerOptions: {
        warningFilter: (warning) => warning.code !== "a11y_invalid_attribute",
      },
    }),
  ],
  server: {
    port: Number(process.env.PORT) || 3003,
    strictPort: true,
  },
})
