import { css } from "styled-system/css"

const focusRing = {
  outline: "2px solid {colors.primary}",
  outlineOffset: "-2px",
}

// a split pill, like the version and framework pills
export const root = css({
  display: "inline-flex",
  flexShrink: "0",
  alignItems: "stretch",
  h: "8",
  rounded: "full",
  bg: "ink/5",
})

const segment = {
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink",
  cursor: "pointer",
  transition: "background 120ms",
  _hover: { bg: "ink/6" },
  _focusVisible: focusRing,
  "& svg": { boxSize: "3.5", color: "ink.muted" },
} as const

export const copy = css({ ...segment, ps: "3", pe: "2.5", roundedLeft: "full" })

export const trigger = css({
  ...segment,
  px: "2",
  roundedRight: "full",
  boxShadow: "inset 1px 0 0 {colors.ink/10}",
  _open: { bg: "ink/6" },
  "& svg": { boxSize: "3.5", color: "ink.muted", transition: "rotate 120ms" },
  "&[data-state=open] svg": { rotate: "180deg" },
})

export const content = css({
  w: "220px",
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
  gap: "2.5",
  w: "full",
  h: "9",
  px: "2",
  rounded: "md",
  fontSize: "14px",
  color: "ink",
  textDecoration: "none",
  cursor: "pointer",
  _highlighted: { bg: "ink/5" },
  "& svg": { flexShrink: "0", color: "ink.muted" },
  "& > svg:first-child": { boxSize: "4" },
})

export const external = css({ ms: "auto", boxSize: "3.5", opacity: "0.6" })
