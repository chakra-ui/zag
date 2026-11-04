import { css } from "styled-system/css"

export const root = css({
  display: "flex",
  flexDirection: "column",
  minW: "0",
  p: "2",
  bg: "surface",
  rounded: "20px",
  boxShadow: "0 0 0 1px {colors.line}, 0 1px 2px {colors.ink/4}",
  transition: "box-shadow 200ms ease-out",
  _hover: {
    boxShadow:
      "0 0 0 1px {colors.line.strong}, 0 12px 32px -20px {colors.ink/25}",
    "& img": { scale: "1.015" },
  },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "3px",
  },
})

export const media = css({
  position: "relative",
  aspectRatio: "16/10",
  overflow: "hidden",
  rounded: "14px",
  bg: "canvas",
  boxShadow: "inset 0 0 0 1px {colors.ink/5}",
  "& img": {
    objectFit: "cover",
    // screenshots put the logo top-left; keep it when the sides crop
    objectPosition: "left top",
    transition: "scale 400ms cubic-bezier(0.2, 0, 0, 1)",
    _motionReduce: { transition: "none" },
  },
})

export const body = css({
  display: "flex",
  flexDirection: "column",
  gap: "1",
  px: "3",
  pt: "3.5",
  pb: "3",
})

export const name = css({
  fontSize: "15px",
  fontWeight: "medium",
  letterSpacing: "-0.01em",
  color: "ink",
})

export const description = css({
  fontSize: "14px",
  lineHeight: "1.5",
  color: "ink.muted",
  lineClamp: "2",
})
