import { css } from "styled-system/css"

// API reference tables: a quiet plate with hairline rows
export const table = css({
  my: "8",
  rounded: "xl",
  bg: "surface",
  boxShadow: "inset 0 0 0 1px {colors.line}",
  overflowX: "auto",
  fontSize: "14px",
})

export const head = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)",
  columnGap: "6",
  px: "4",
  h: "10",
  alignItems: "center",
  borderBottomWidth: "1px",
  borderColor: "line",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink.muted",
  hideBelow: "sm",
})

// names the part a group of rows belongs to
export const group = css({
  px: "4",
  py: "2",
  bg: "ink/3",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink",
  "* + &": { borderTopWidth: "1px", borderColor: "line" },
  "& + *": { borderTopWidth: "1px", borderColor: "line" },
})

export const row = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", sm: "minmax(0, 2fr) minmax(0, 3fr)" },
  columnGap: "6",
  rowGap: "1.5",
  alignItems: "baseline",
  px: "4",
  py: "3",
  "& + &": { borderTopWidth: "1px", borderColor: "line.edge" },
})

export const key = css({
  fontFamily: "mono",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink",
  overflowWrap: "anywhere",
})

export const value = css({ color: "ink.muted", lineHeight: "1.6" })

export const keys = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "1.5",
})
