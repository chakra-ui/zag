import { css } from "styled-system/css"

export const root = css({
  display: "grid",
  gridTemplateColumns: {
    base: "minmax(0, 1fr)",
    md: "repeat(3, minmax(0, 1fr))",
  },
  gap: "4",
  my: "8",
  listStyle: "none",
  p: "0",
})

export const card = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5",
  h: "full",
  p: "5",
  rounded: "2xl",
  bg: "surface",
  boxShadow: "inset 0 0 0 1px {colors.line}",
  color: "ink",
  textDecoration: "none",
  transition: "box-shadow 120ms",
  _hover: {
    boxShadow:
      "inset 0 0 0 1px {colors.line.strong}, 0 12px 24px -16px rgb(0 0 0 / 0.25)",
  },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "2px",
  },
})

export const top = css({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  mb: "4",
})

export const icon = css({
  display: "grid",
  placeItems: "center",
  boxSize: "9",
  rounded: "lg",
  bg: "primary.soft",
  color: "primary",
  "& svg": { boxSize: "4.5" },
})

export const step = css({
  fontSize: "40px",
  lineHeight: "1",
  fontWeight: "medium",
  letterSpacing: "-0.04em",
  color: "ink/15",
  fontVariantNumeric: "tabular-nums",
})

export const title = css({
  fontSize: "16px",
  fontWeight: "medium",
  color: "ink",
})

export const description = css({
  fontSize: "14px",
  lineHeight: "1.55",
  color: "ink.muted",
  flex: "1",
})

export const result = css({
  alignSelf: "flex-start",
  mt: "3",
  px: "2",
  py: "0.5",
  rounded: "md",
  bg: "bg.code.inline",
  fontFamily: "mono",
  fontSize: "12.5px",
  color: "ink",
})
