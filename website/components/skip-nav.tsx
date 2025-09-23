import { cva } from "styled-system/css"
import { styled } from "styled-system/jsx"

const skipNavLinkRecipe = cva({
  base: {
    userSelect: "none",
    border: "0",
    height: "1px",
    width: "1px",
    margin: "-1px",
    padding: "0",
    overflow: "hidden",
    position: "absolute",
    clip: "rect(0 0 0 0)",
    zIndex: "40",
    px: "4",
    py: "2",
    bg: "green.200",
    _focus: {
      clip: "auto",
      width: "auto",
      height: "auto",
    },
  },
})

export const SkipNavLink = styled("a", skipNavLinkRecipe, {
  defaultProps: {
    href: "#skip-nav",
  },
})
