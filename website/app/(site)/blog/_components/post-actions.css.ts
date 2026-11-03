import { css } from "styled-system/css"

export const actions = css({ display: "flex", gap: "2", ms: "auto" })

export const action = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  h: "8",
  px: "3",
  rounded: "full",
  bg: "ink/5",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink.muted",
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "color 150ms, background 150ms",
  _hover: { bg: "ink/8", color: "ink" },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "2px",
  },
  "& svg": { boxSize: "3.5", flexShrink: "0" },
})
