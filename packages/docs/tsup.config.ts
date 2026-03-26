import { defineConfig } from "tsup"
import rootConfig from "../../tsup.config"

export default defineConfig({
  ...rootConfig,
  target: "node20.10",
})
