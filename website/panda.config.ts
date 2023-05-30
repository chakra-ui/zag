import { defineConfig } from "@pandacss/dev"
import theme from "theme"
import { globalCss } from "./theme/global-css"

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  theme,

  globalCss,

  conditions: {
    activeLink: "&[aria-current=page]",
  },

  // The output directory for your css system
  outdir: "styled-system",
})
