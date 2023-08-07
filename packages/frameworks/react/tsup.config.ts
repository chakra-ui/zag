import { defineConfig } from "tsup"
import rootConfig from "../../../tsup.config"

export default defineConfig({
  ...rootConfig,
  banner: {
    js: '"use client"',
  },
})
