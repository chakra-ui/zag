import { css } from "styled-system/css"

const focusRing = {
  outline: "2px solid {colors.primary}",
  outlineOffset: "-2px",
}

export const root = css({ pt: "8", pb: "10" })

export const groups = css({
  display: "flex",
  flexDirection: "column",
  gap: "6",
})

export const group = css({ display: "flex", flexDirection: "column", gap: "1" })

export const heading = css({
  px: "2.5",
  pb: "1",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink",
})

export const list = css({
  display: "flex",
  flexDirection: "column",
  gap: "1px",
})

export const link = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  h: "8",
  px: "2.5",
  rounded: "lg",
  fontSize: "14px",
  color: "ink/80",
  transition: "color 120ms, background 120ms",
  _hover: { color: "ink", bg: "ink/4" },
  _focusVisible: focusRing,
  _currentPage: {
    color: "ink",
    bg: { base: "primary/10", _dark: "primary/12" },
    fontWeight: "medium",
    _hover: { bg: { base: "primary/14", _dark: "primary/16" } },
  },
})

export const badge = css({
  px: "1.5",
  rounded: "full",
  bg: "primary.soft",
  fontSize: "11px",
  fontWeight: "medium",
  lineHeight: "18px",
  color: "primary",
})

// marks recently added pages; the hidden text keeps it announced
export const newDot = css({
  boxSize: "1.5",
  flexShrink: "0",
  rounded: "full",
  bg: "primary.solid",
})

export const srOnly = css({ srOnly: true })
