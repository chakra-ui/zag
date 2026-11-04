import { css } from "styled-system/css"

// matches the version pill beside it
export const trigger = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  h: "6",
  ps: "2",
  pe: "1.5",
  rounded: "full",
  bg: "ink/6",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink",
  cursor: "pointer",
  transition: "background 120ms",
  _hover: { bg: "ink/10" },
  _open: { bg: "ink/10" },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "2px",
  },
  "& svg": { boxSize: "3.5" },
})

export const chevron = css({ color: "ink.muted" })

export const content = css({
  w: "200px",
  zIndex: "1000",
  p: "1.5",
  rounded: "xl",
  bg: "surface",
  boxShadow: {
    base: "0 0 0 1px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04), 0 16px 24px -8px rgb(0 0 0 / 0.06)",
    _dark:
      "0 0 0 1px rgb(255 255 255 / 0.1), 0 16px 32px -8px rgb(0 0 0 / 0.6)",
  },
  outline: "0",
})

export const item = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  h: "9",
  px: "2",
  rounded: "md",
  fontSize: "14px",
  color: "ink.muted",
  cursor: "pointer",
  _checked: { color: "ink" },
  _highlighted: { bg: "ink/5", color: "ink" },
  "& svg": { boxSize: "4" },
})

export const check = css({ ms: "auto", color: "ink" })
