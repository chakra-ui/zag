import { css } from "styled-system/css"

export const cells = css({
  gap: "1px",
  bg: "border",
  borderTopWidth: "1px",
  borderColor: "border",
  "& > *": { bg: "bg" },
})
