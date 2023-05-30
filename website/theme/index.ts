import { Config } from "@pandacss/types"
import { layerStyles } from "./layer-styles"
import { textStyles } from "./text-styles"
import { semanticTokens } from "./semantic-tokens"
import { recipes } from "./recipes"

const theme: Config["theme"] = {
  extend: {
    breakpoints: {
      xs: "20rem",
      sm: "30em",
      md: "48em",
      lg: "62em",
      xl: "80em",
      "2xl": "96em",
    },
    tokens: {
      colors: {
        blackAlpha: {
          50: { value: "rgba(0, 0, 0, 0.04)" },
          100: { value: "rgba(0, 0, 0, 0.06)" },
          200: { value: "rgba(0, 0, 0, 0.08)" },
          300: { value: "rgba(0, 0, 0, 0.16)" },
          400: { value: "rgba(0, 0, 0, 0.24)" },
          500: { value: "rgba(0, 0, 0, 0.36)" },
          600: { value: "rgba(0, 0, 0, 0.48)" },
          700: { value: "rgba(0, 0, 0, 0.64)" },
          800: { value: "rgba(0, 0, 0, 0.80)" },
          900: { value: "rgba(0, 0, 0, 0.92)" },
        },
        whiteAlpha: {
          50: { value: "rgba(255, 255, 255, 0.04)" },
          100: { value: "rgba(255, 255, 255, 0.06)" },
          200: { value: "rgba(255, 255, 255, 0.08)" },
          300: { value: "rgba(255, 255, 255, 0.16)" },
          400: { value: "rgba(255, 255, 255, 0.24)" },
          500: { value: "rgba(255, 255, 255, 0.36)" },
          600: { value: "rgba(255, 255, 255, 0.48)" },
          700: { value: "rgba(255, 255, 255, 0.64)" },
          800: { value: "rgba(255, 255, 255, 0.80)" },
          900: { value: "rgba(255, 255, 255, 0.92)" },
        },
      },
    },
    layerStyles,
    textStyles,
    semanticTokens,

    recipes,
  },
}

export default theme
