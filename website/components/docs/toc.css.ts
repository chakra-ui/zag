import { css } from "styled-system/css"

export const root = css({ pt: "10", pb: "10" })

export const track = css({ position: "relative" })

export const heading = css({
  mb: "3",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink",
})

// the rail; the indicator slides along it to the active link
export const list = css({
  display: "flex",
  flexDirection: "column",
  boxShadow: "inset 1px 0 0 {colors.line}",
})

export const link = css({
  display: "block",
  py: "1",
  ps: "3",
  fontSize: "13px",
  lineHeight: "1.45",
  color: "ink.muted",
  transition: "color 120ms",
  _hover: { color: "ink" },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "-2px",
  },
  "[data-depth='3'] > &, [data-depth='4'] > &": { ps: "6" },
  "&[data-active]": { color: "ink" },
})

export const indicator = css({
  top: "var(--top)",
  left: "var(--left)",
  w: "1px",
  h: "var(--height)",
  bg: "ink",
  transition: "top 200ms ease, height 200ms ease",
  _motionReduce: { transition: "none" },
})
