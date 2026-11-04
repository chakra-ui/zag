import { css } from "styled-system/css"

export const root = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "2",
  mt: "6",
  mb: "10",
})

// quiet pills, like the version and copy page controls
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
  color: "ink",
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "background 120ms",
  _hover: { bg: "ink/8" },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "2px",
  },
  "& svg": { flexShrink: "0", color: "ink.muted" },
  "& > svg:first-child": { boxSize: "3.5" },
})

export const arrow = css({ boxSize: "3", opacity: "0.7" })
