import { css } from "styled-system/css"

export const inlineCode = css({
  py: "0.1em",
  px: "0.4em",
  mx: "0.1em",
  rounded: "6px",
  bg: "bg.code.inline",
  boxShadow: "inset 0 0 0 1px {colors.line.edge}",
  fontFamily: "mono",
  fontSize: "0.86em",
  color: "ink",
  whiteSpace: "nowrap",
})
