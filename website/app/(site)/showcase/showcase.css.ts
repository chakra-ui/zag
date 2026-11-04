import { css } from "styled-system/css"

export const grid = css({
  display: "grid",
  gridTemplateColumns: {
    base: "minmax(0, 1fr)",
    sm: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(3, minmax(0, 1fr))",
  },
  gap: "4",
})
