import { css } from "styled-system/css"

export const root = css({
  display: "flex",
  justifyContent: "space-between",
  gap: "6",
  mt: "16",
  pt: "6",
  borderTopWidth: "1px",
  borderColor: "line",
})

export const link = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5",
  minW: "0",
  maxW: "50%",
  textDecoration: "none",
  outline: "none",
  "&[rel=next]": { ms: "auto", textAlign: "end" },
  _hover: { "& [data-title]": { color: "primary" } },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "4px",
    rounded: "sm",
  },
})

export const label = css({
  fontSize: "13px",
  color: "ink.muted",
})

export const title = css({
  fontSize: "15px",
  fontWeight: "medium",
  color: "ink",
  truncate: true,
  transition: "color 120ms",
})
