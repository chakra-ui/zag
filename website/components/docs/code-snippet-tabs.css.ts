import { css } from "styled-system/css"

// one plate for the framework tabs and the code, like a titled code block
export const root = css({
  my: "8",
  rounded: "xl",
  bg: "bg.code.block",
  boxShadow: "inset 0 0 0 1px {colors.line}",
  overflow: "hidden",
})

export const bar = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "2",
  h: "11",
  px: "1.5",
  borderBottomWidth: "1px",
  borderColor: "line",
})

export const list = css({
  display: "flex",
  gap: "0.5",
  minW: "0",
  overflowX: "auto",
  scrollbarWidth: "none",
})

export const tab = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  flexShrink: "0",
  h: "7",
  px: "2.5",
  rounded: "md",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink.muted",
  cursor: "pointer",
  transition: "color 120ms, background 120ms",
  "& svg": { boxSize: "3.5", filter: "grayscale(1)", opacity: "0.7" },
  _hover: { color: "ink" },
  _selected: {
    color: "ink",
    bg: "ink/6",
    "& svg": { filter: "none", opacity: "1" },
  },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "-2px",
  },
})

// the code inside sits flush on the plate
export const panel = css({
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "-2px",
  },
  "& > div, & .prose > div": { my: "0" },
  "& pre": { m: "0", border: "0", rounded: "0", bg: "transparent" },
})

export const empty = css({ p: "4", fontSize: "14px", color: "ink.muted" })
