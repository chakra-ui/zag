import { css } from "styled-system/css"

export const button = css({
  display: "grid",
  placeItems: "center",
  boxSize: "7",
  flexShrink: "0",
  rounded: "md",
  color: "ink.muted",
  cursor: "pointer",
  transition: "background 120ms, color 120ms",
  _hover: { bg: "ink/6", color: "ink" },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "-2px",
  },
  "& svg": { boxSize: "4" },
})
