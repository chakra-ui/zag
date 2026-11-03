import { css } from "styled-system/css"

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

export const td = css({
  px: "4",
  py: "3",
  verticalAlign: "top",
  borderColor: "line.edge",
  "tr + tr > &": { borderTopWidth: "1px" },
})

const mono = { fontFamily: "mono", fontSize: "13px" } as const

export const key = css({
  ...mono,
  fontWeight: "medium",
  color: "ink",
  whiteSpace: "nowrap",
})

export const defaultValue = css({
  ...mono,
  color: "primary",
  whiteSpace: "nowrap",
})

export const empty = css({ color: "ink.muted" })

export const type = css({
  ...mono,
  color: "syntax.function",
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
})

export const description = css({
  mt: "1",
  color: "ink.muted",
  lineHeight: "1.6",
  textWrap: "pretty",
})
