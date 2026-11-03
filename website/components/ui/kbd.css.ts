import { css } from "styled-system/css"

export const kbd = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minW: "6",
  h: "6",
  px: "1.5",
  rounded: "md",
  bg: "surface",
  boxShadow:
    "inset 0 0 0 1px {colors.line}, inset 0 -1px 0 {colors.line.strong}",
  fontFamily: "mono",
  fontSize: "12px",
  lineHeight: "1",
  color: "ink",
  whiteSpace: "nowrap",
})
