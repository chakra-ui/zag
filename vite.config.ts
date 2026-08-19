import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    // Tests colocated in `src` are also emitted to `dist`, so skip the built copies.
    exclude: [...configDefaults.exclude, "**/dist/**"],
  },
})
