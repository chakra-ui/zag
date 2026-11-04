import { css } from "styled-system/css"

// same cap as the framework snippets; taller blocks scroll inside or expand
export const pre = css({
  maxH: "480px",
  overflow: "auto",
  "[data-expanded] > &": { maxH: "none", pb: "16" },
})

export const body = css({
  position: "relative",
  my: "8",
  "& > pre": { m: "0" },
  // fades the cut-off lines into the plate
  "&[data-collapsible]:not([data-expanded])::after": {
    content: '""',
    position: "absolute",
    insetX: "1px",
    bottom: "1px",
    h: "28",
    roundedBottom: "xl",
    bgGradient: "to-b",
    gradientFrom: "bg.code.block/0",
    gradientTo: "bg.code.block",
    pointerEvents: "none",
  },
})

export const toggle = css({
  position: "absolute",
  zIndex: "1",
  bottom: "3",
  left: "50%",
  translate: "-50% 0",
  display: "inline-flex",
  alignItems: "center",
  gap: "1",
  h: "8",
  px: "3",
  rounded: "full",
  bg: "surface",
  boxShadow: "0 0 0 1px {colors.line}, 0 4px 12px -6px rgb(0 0 0 / 0.2)",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink",
  cursor: "pointer",
  _hover: {
    boxShadow:
      "0 0 0 1px {colors.line.strong}, 0 4px 12px -6px rgb(0 0 0 / 0.2)",
  },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "2px",
  },
  "& svg": { boxSize: "3.5", color: "ink.muted", transition: "rotate 150ms" },
  "&[aria-expanded=true] svg": { rotate: "180deg" },
})

// a titled block: the header and the code share one plate
export const frame = css({
  my: "8",
  rounded: "xl",
  bg: "bg.code.block",
  boxShadow: "inset 0 0 0 1px {colors.line}",
  overflow: "hidden",
  "& > div": { my: "0" },
  "& pre": { border: "0", rounded: "0" },
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
