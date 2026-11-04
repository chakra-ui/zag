import { css } from "styled-system/css"

export const link = css({
  color: "ink",
  fontWeight: "medium",
  textDecoration: "underline",
  textDecorationColor: "primary.solid/60",
  textDecorationThickness: "1px",
  textUnderlineOffset: "3px",
  cursor: "pointer",
  transition: "text-decoration-color 120ms, color 120ms",
  _hover: { color: "primary", textDecorationColor: "currentColor" },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "2px",
    rounded: "2px",
  },
})
