import { sveltekit } from "@sveltejs/kit/vite"
import { viteCommonjs } from "@originjs/vite-plugin-commonjs"
import { defineConfig } from "vite"
import pkg from "./package.json"

const { dependencies } = pkg

export default defineConfig({
  plugins: [
    viteCommonjs({
      include: ["country-list"],
    }),
    sveltekit(),
  ],
  ssr: {
    noExternal: [...Object.keys(dependencies)],
  },
})
