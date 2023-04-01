import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import pkg from "./package.json"

const { dependencies } = pkg

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: [...Object.keys(dependencies)],
  },
})
