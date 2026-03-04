import adapter from "@sveltejs/adapter-auto"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import { readFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load package mappings
let packageMap = {}
const packageMapPath = resolve(__dirname, "package-map.json")
if (existsSync(packageMapPath)) {
  packageMap = JSON.parse(readFileSync(packageMapPath, "utf8"))
} else {
  console.warn("⚠️  package-map.json not found. Run: node package-map.mjs")
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    alias: packageMap,
  },
}

export default config
