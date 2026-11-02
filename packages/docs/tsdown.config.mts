import { defineConfig } from "tsdown"
import rootConfig from "../../tsdown.config.mts"

export default defineConfig({
  ...rootConfig,
  target: "node20.10",
})
