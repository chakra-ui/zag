import { css } from "styled-system/css"

const focusRing = {
  outline: "2px solid {colors.primary}",
  outlineOffset: "2px",
}
const mono = { fontFamily: "mono", fontSize: "13px" } as const

export const root = css({
  my: "8",
  rounded: "xl",
  bg: "surface",
  boxShadow: "inset 0 0 0 1px {colors.line}",
  overflowX: "auto",
})

export const table = css({
  w: "full",
  borderCollapse: "collapse",
  fontSize: "14px",
})

export const th = css({
  h: "10",
  px: "4",
  textAlign: "start",
  borderBottomWidth: "1px",
  borderColor: "line",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink.muted",
  whiteSpace: "nowrap",
})

export const thEnd = css({ textAlign: "end", w: "1%" })

export const expandAll = css({
  fontSize: "12.5px",
  fontWeight: "medium",
  color: "ink.muted",
  cursor: "pointer",
  _hover: { color: "ink" },
  _focusVisible: focusRing,
})

// each prop row and its details share a tbody
export const group = css({
  "& + &": { borderTopWidth: "1px", borderColor: "line.edge" },
})

export const summary = css({
  cursor: "pointer",
  transition: "background 120ms",
  _hover: { bg: "ink/3" },
  "[data-state=open] > &": { bg: "ink/3" },
})

// markdown and value tables
export const td = css({
  px: "4",
  py: "3",
  verticalAlign: "top",
  borderColor: "line.edge",
  "tr + tr > &": { borderTopWidth: "1px" },
})

// prop rows: one line each
export const cell = css({ h: "11", px: "4", verticalAlign: "middle" })

export const trigger = css({
  display: "inline-flex",
  alignItems: "center",
  textAlign: "start",
  cursor: "pointer",
  rounded: "sm",
  _focusVisible: focusRing,
})

export const key = css({
  ...mono,
  fontWeight: "medium",
  color: "ink",
  whiteSpace: "nowrap",
})

export const type = css({
  ...mono,
  color: "syntax.function",
  whiteSpace: "nowrap",
})

export const defaultValue = css({
  ...mono,
  color: "primary",
  whiteSpace: "nowrap",
})

export const empty = css({ color: "ink.muted" })

export const chevronCell = css({ w: "1%", px: "4", textAlign: "end" })

export const chevron = css({
  display: "inline-block",
  boxSize: "4",
  color: "ink.muted",
  transition: "rotate 150ms",
  "[data-state=open] &": { rotate: "180deg" },
  _motionReduce: { transition: "none" },
})

export const details = css({
  px: "4",
  pt: "1",
  pb: "4",
  bg: "ink/3",
})

export const description = css({
  maxW: "72ch",
  color: "ink.muted",
  lineHeight: "1.6",
  textWrap: "pretty",
})

export const meta = css({
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  columnGap: "4",
  rowGap: "1",
  mt: "3",
  "& dt": { fontSize: "13px", color: "ink.muted" },
  "& dd": { m: "0" },
})

export const fullType = css({
  ...mono,
  color: "syntax.function",
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
})
