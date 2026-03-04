import { cva } from "styled-system/css"
import { styled } from "styled-system/jsx"

const iconRecipe = cva({
  base: {
    width: "1em",
    height: "1em",
    verticalAlign: "middle",
  },
})

export const Icon = styled("svg", iconRecipe, {
  defaultProps: {
    "aria-hidden": true,
    focusable: "false",
  },
})
