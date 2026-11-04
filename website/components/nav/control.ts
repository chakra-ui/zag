import { css } from "styled-system/css"

export const focusRing = {
  outline: "2px solid",
  outlineColor: "border.primary.bold",
  outlineOffset: "-2px",
}

export const navControl = css({
  w: "9",
  rounded: "full",
  h: "full",
  flexShrink: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bg: "transparent",
  color: "ink.muted",
  cursor: "pointer",
  transition: "color 120ms, background 120ms, box-shadow 120ms",
  _hover: { color: "ink", bg: "surface", boxShadow: "0 0 0 1px {colors.line}" },
  _focusVisible: focusRing,
  "& svg": { boxSize: "4", flexShrink: "0" },
})

export const navCluster = css({
  display: "flex",
  alignItems: "stretch",
  h: "9",
  gap: "2px",
})
