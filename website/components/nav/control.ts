import { css } from "styled-system/css"

export const focusRing = {
  outline: "2px solid",
  outlineColor: "border.primary.bold",
  outlineOffset: "-2px",
}

export const navControl = css({
  w: "9",
  h: "full",
  flexShrink: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bg: "bg",
  color: "text.muted",
  cursor: "pointer",
  transition: "color 120ms, background 120ms",
  _hover: { color: "text.bold", bg: "bg.muted" },
  _focusVisible: focusRing,
  "& svg": { boxSize: "4", flexShrink: "0" },
})

export const navCluster = css({
  display: "flex",
  alignItems: "stretch",
  h: "9",
  gap: "1px",
  bg: "border",
  borderWidth: "1px",
  borderColor: "border",
  rounded: "md",
  overflow: "hidden",
})
