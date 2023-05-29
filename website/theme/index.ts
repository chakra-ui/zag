import { foundations } from "@chakra-ui/theme/foundations"
import { components } from "./components"
import { globalStyles } from "./global-styles"
import { layerStyles } from "./layer-styles"
import { textStyles } from "./text-styles"
import { semanticTokens } from "./semantic-tokens"

const theme = {
  ...foundations,
  fonts: {
    ...foundations.fonts,
    heading: "'Spline Sans', sans-serif",
    body: "'Spline Sans', sans-serif",
  },
  config: {
    useSystemColorMode: false,
    initialColorMode: "light",
  },
  breakpoints: {
    xs: "20rem",
    sm: "30em",
    md: "48em",
    lg: "62em",
    xl: "80em",
    "2xl": "96em",
  },
  styles: {
    global: globalStyles,
  },
  layerStyles,
  textStyles,
  components,
  semanticTokens,
}

export default theme
