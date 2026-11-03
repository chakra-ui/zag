import { css } from "styled-system/css"

// a titled block: the header and the code share one plate
export const frame = css({
  mt: "8",
  mb: "8",
  rounded: "xl",
  bg: "bg.code.block",
  boxShadow: "inset 0 0 0 1px {colors.line}",
  overflow: "hidden",
  "& pre": { m: "0", border: "0", rounded: "0" },
})

export const header = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  h: "10",
  // lines up with the code, which prism pads by 12px
  px: "3",
  borderBottomWidth: "1px",
  borderColor: "line",
  fontFamily: "mono",
  fontSize: "12.5px",
  color: "ink.muted",
  "& svg": { boxSize: "3.5", flexShrink: "0" },
})
