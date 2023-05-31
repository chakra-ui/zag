import { defineConfig } from "@pandacss/dev"
import theme from "theme"
import { globalCss } from "./theme/global-css"
import { iconPreset } from "./theme/icons"

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  presets: ["@pandacss/dev/presets", iconPreset],

  // Where to look for your css declarations
  include: [
    "./components/**/*.{js,jsx,ts,tsx}",
    "./layouts/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./sidebar.config.ts",
  ],

  // Files to exclude
  exclude: [],

  theme,

  globalCss,

  conditions: {
    activeLink: "&[aria-current=page]",
  },

  // The output directory for your css system
  outdir: "styled-system",

  jsxFramework: "react",
})
