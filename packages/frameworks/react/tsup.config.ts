import { defineConfig } from "tsup"
import { readFileSync, writeFileSync } from "fs"
import rootConfig from "../../../tsup.config"

export default defineConfig({
  ...rootConfig,
  async onSuccess() {
    const files = ["dist/index.mjs", "dist/index.js"]
    for (const file of files) {
      const content = readFileSync(file, "utf8")
      writeFileSync(file, `"use client";\n\n${content}`)
    }
  },
})
