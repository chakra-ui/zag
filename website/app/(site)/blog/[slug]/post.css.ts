import { css } from "styled-system/css"
import { container } from "theme/layout"

const focusRing = {
  outline: "2px solid {colors.primary}",
  outlineOffset: "2px",
} as const

export const root = css({
  display: "grid",
  gridTemplateColumns: { base: "minmax(0, 1fr)", xl: "minmax(0, 860px) 232px" },
  justifyContent: "space-between",
  columnGap: "16",
  ...container,
})

export const article = css({
  display: "flex",
  flexDirection: "column",
  gap: "6",
  minW: "0",
  pt: { base: "12", md: "16" },
  pb: "28",
})

export const back = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  w: "fit-content",
  fontSize: "14px",
  color: "ink.muted",
  transition: "color 150ms",
  _hover: { color: "ink" },
  _focusVisible: focusRing,
})

export const meta = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "2.5",
  mt: "4",
  fontSize: "13px",
  color: "ink.muted",
})

export const title = css({
  fontSize: "clamp(36px, 4.4vw, 52px)",
  lineHeight: "1.08",
  fontWeight: "medium",
  letterSpacing: "-0.035em",
  color: "ink",
  textWrap: "balance",
})

export const lead = css({
  maxW: "60ch",
  fontSize: { base: "17px", md: "18px" },
  lineHeight: "1.65",
  color: "ink.muted",
  textWrap: "pretty",
})

export const authors = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "4",
  py: "4",
  borderYWidth: "1px",
  borderColor: "line",
})

export const author = css({
  display: "flex",
  alignItems: "center",
  gap: "2.5",
  fontSize: "14px",
  fontWeight: "medium",
  color: "ink",
  rounded: "full",
  _hover: { color: "ink.muted" },
  _focusVisible: focusRing,
})

export const avatar = css({
  boxSize: "7",
  rounded: "full",
  bg: "ink/6",
  boxShadow: "0 0 0 1px {colors.line}",
})

export const prose = css({
  fontSize: "17px",
  lineHeight: "1.8",
  color: "ink",
  "& :is(h2, h3)": {
    fontWeight: "medium",
    letterSpacing: "-0.025em",
    textWrap: "balance",
  },
  "& h2": { fontSize: "26px", mt: "12" },
  "& li::marker": { color: "ink.muted" },
  "& hr": { my: "10", borderColor: "line" },
  "& img": { maxW: "100%", h: "auto", rounded: "xl" },
})

export const pager = css({
  display: "grid",
  gridTemplateColumns: {
    base: "minmax(0, 1fr)",
    sm: "repeat(2, minmax(0, 1fr))",
  },
  gap: "4",
  mt: "8",
})

export const pagerLink = css({
  display: "flex",
  flexDirection: "column",
  gap: "1.5",
  p: "5",
  bg: "surface",
  rounded: "16px",
  boxShadow: "0 0 0 1px {colors.line}",
  transition: "box-shadow 200ms",
  _hover: { boxShadow: "0 0 0 1px {colors.line.strong}" },
  _focusVisible: focusRing,
  "&[data-end]": {
    gridColumn: { sm: "2" },
    alignItems: { sm: "flex-end" },
    textAlign: { sm: "end" },
  },
})

export const pagerLabel = css({ fontSize: "13px", color: "ink.muted" })

export const pagerTitle = css({
  fontSize: "15px",
  fontWeight: "medium",
  color: "ink",
  textWrap: "balance",
})

export const aside = css({ hideBelow: "xl" })

export const sticky = css({
  position: "sticky",
  top: "calc(4rem + 1rem)",
  pt: "6",
})

export const asideLinks = css({
  display: "flex",
  flexDirection: "column",
  gap: "2",
  pt: "4",
  borderTopWidth: "1px",
  borderColor: "line",
})

export const asideLink = css({
  w: "fit-content",
  fontSize: "13px",
  color: "ink.muted",
  transition: "color 150ms",
  _hover: { color: "ink" },
  _focusVisible: focusRing,
})
