import { css, cva } from "styled-system/css"

const focusRing = {
  outline: "2px solid {colors.primary}",
  outlineOffset: "2px",
} as const

export const rss = css({
  color: "ink",
  textDecoration: "underline",
  textDecorationColor: "line.strong",
  textUnderlineOffset: "3px",
  transition: "text-decoration-color 150ms",
  _hover: { textDecorationColor: "ink" },
  _focusVisible: focusRing,
})

export const filters = css({
  display: "inline-flex",
  flexShrink: "0",
  gap: "2px",
  p: "3px",
  rounded: "full",
  bg: "ink/6",
})

export const filter = css({
  display: "inline-flex",
  alignItems: "center",
  h: "28px",
  px: "3",
  rounded: "full",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink.muted",
  transition: "color 150ms, background 150ms",
  _hover: { color: "ink" },
  _focusVisible: { ...focusRing, outlineOffset: "-2px" },
  "&[aria-current=page]": {
    bg: "surface",
    color: "ink",
    boxShadow: "0 0 0 1px {colors.line}",
  },
})

export const featured = css({
  display: "grid",
  gridAutoFlow: { md: "column" },
  gridAutoColumns: "minmax(0, 1fr)",
  bg: "surface",
  rounded: "20px",
  boxShadow: "0 0 0 1px {colors.line}",
  overflow: "hidden",
  transition: "box-shadow 200ms",
  _hover: {
    boxShadow: "0 0 0 1px {colors.line.strong}",
    "& [data-part=cta]": { translate: "2px 0" },
  },
  _focusVisible: focusRing,
})

export const featuredBody = css({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "3",
  p: { base: "6", md: "10" },
})

export const meta = css({
  display: "flex",
  alignItems: "center",
  gap: "2.5",
  fontSize: "13px",
  color: "ink.muted",
})

export const typePill = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    h: "22px",
    px: "2.5",
    rounded: "full",
    fontSize: "12px",
    fontWeight: "medium",
    textTransform: "capitalize",
  },
  variants: {
    type: {
      release: { bg: "primary.soft", color: "primary" },
      article: { bg: "ink/6", color: "ink.muted" },
    },
  },
})

export const featuredTitle = css({
  fontSize: { base: "26px", md: "32px" },
  lineHeight: "1.15",
  fontWeight: "medium",
  letterSpacing: "-0.03em",
  color: "ink",
  textWrap: "balance",
})

export const featuredLead = css({
  fontSize: "16px",
  lineHeight: "1.65",
  color: "ink.muted",
  textWrap: "pretty",
})

export const featuredCta = css({
  mt: "2",
  fontSize: "14px",
  fontWeight: "medium",
  color: "primary",
  transition: "translate 150ms ease-out",
})

export const list = css({
  display: "flex",
  flexDirection: "column",
  gap: "10",
  mt: "14",
})

export const year = css({
  pb: "3",
  mb: "2",
  borderBottomWidth: "1px",
  borderColor: "line",
  fontSize: "14px",
  fontWeight: "medium",
  color: "ink.muted",
})

export const row = css({
  display: "grid",
  gridTemplateColumns: {
    base: "minmax(0, 1fr)",
    md: "88px minmax(0, 1fr) auto",
  },
  alignItems: "center",
  gap: { base: "1.5", md: "6" },
  mx: "-4",
  px: "4",
  py: "4",
  rounded: "14px",
  transition: "background 150ms",
  _hover: { bg: "ink/4" },
  _focusVisible: { ...focusRing, outlineOffset: "0" },
})

export const date = css({ fontSize: "13px", color: "ink.muted" })

export const rowText = css({
  display: "flex",
  flexDirection: "column",
  gap: "1",
  minW: "0",
})

export const rowTitle = css({
  fontSize: "17px",
  fontWeight: "medium",
  letterSpacing: "-0.01em",
  color: "ink",
  textWrap: "balance",
})

export const rowLead = css({
  fontSize: "14px",
  lineHeight: "1.55",
  color: "ink.muted",
  textWrap: "pretty",
})

export const rowAside = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  mt: { base: "1", md: "0" },
})

export const avatars = css({ display: "flex" })

export const avatar = css({
  boxSize: "22px",
  rounded: "full",
  bg: "ink/6",
  boxShadow: "0 0 0 2px {colors.canvas}",
  "& + &": { ms: "-6px" },
})

export const empty = css({ py: "16", fontSize: "14px", color: "ink.muted" })
