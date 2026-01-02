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
    zIndex: "60",
    px: "4",
    py: "2",
    bg: "green.500",
    color: "white",
    _focus: {
      clip: "auto",
      width: "auto",
      height: "auto",
      top: "2",
      insetStart: "2",
    },
  },
})

export const SkipNavLink = styled("a", skipNavLinkRecipe, {
  defaultProps: {
    href: "#skip-nav",
  },
})

export const SkipNavContent = styled(
  "div",
  {
    base: {
      scrollMarginTop: "20",
    },
  },
  {
    defaultProps: {
      id: "skip-nav",
      tabIndex: -1,
    },
  },
)
