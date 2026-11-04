import { css } from "styled-system/css"

export const EXIT_MS = 140

const motion = {
  transitionProperty: "opacity, transform",
  transitionDuration: `${EXIT_MS}ms`,
  transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
  _motionReduce: { transitionDuration: "0ms" },
} as const

export const backdrop = css({
  ...motion,
  position: "fixed",
  inset: "0",
  zIndex: "1000",
  bg: { base: "rgb(0 0 0 / 0.2)", _dark: "rgb(0 0 0 / 0.55)" },
  backdropFilter: "blur(2px)",
  "&[data-state=closed]": { opacity: "0" },
})

export const positioner = css({
  position: "fixed",
  inset: "0",
  zIndex: "1000",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  px: "4",
  pt: { base: "4", md: "14vh" },
  pb: "4",
})

export const panel = css({
  ...motion,
  display: "flex",
  flexDirection: "column",
  w: "full",
  maxW: "560px",
  maxH: "full",
  overflow: "hidden",
  rounded: "2xl",
  bg: "surface",
  boxShadow: "0 0 0 1px {colors.line}, 0 24px 64px -24px rgb(0 0 0 / 0.4)",
  outline: "0",
  "@starting-style": {
    opacity: "0",
    transform: "translateY(-6px) scale(0.99)",
  },
  "&[data-state=closed]": {
    opacity: "0",
    transform: "translateY(-4px) scale(0.99)",
  },
})

export const root = css({ display: "flex", flexDirection: "column", minH: "0" })

export const inputRow = css({
  display: "flex",
  alignItems: "center",
  gap: "2.5",
  h: "12",
  flexShrink: "0",
  px: "4",
  borderBottomWidth: "1px",
  borderColor: "line",
  "& > svg": { boxSize: "4", flexShrink: "0", color: "ink.muted" },
})

export const input = css({
  flex: "1",
  minW: "0",
  h: "full",
  bg: "transparent",
  border: "none",
  outline: "0",
  fontSize: { base: "16px", md: "15px" },
  color: "ink",
  _placeholder: { color: "ink.muted" },
})

export const esc = css({
  h: "5",
  px: "1.5",
  rounded: "md",
  bg: "ink/6",
  fontFamily: "mono",
  fontSize: "11px",
  color: "ink.muted",
  cursor: "pointer",
  _hover: { color: "ink" },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "2px",
  },
})

// the list part is the scroll container, so the machine keeps the highlight in view
export const list = css({
  minH: "0",
  maxH: { base: "calc(100dvh - 120px)", md: "min(400px, 56vh)" },
  overflowY: "auto",
  overscrollBehavior: "contain",
  p: "1.5",
  outline: "0",
})

export const group = css({
  px: "3",
  pt: "3",
  pb: "1",
  fontSize: "12px",
  fontWeight: "medium",
  color: "ink.muted",
  _first: { pt: "1.5" },
})

export const item = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: "1",
  minW: "0",
  h: "9",
  px: "3",
  rounded: "lg",
  fontSize: "14px",
  color: "ink",
  textDecoration: "none",
  cursor: "pointer",
  scrollMarginBlock: "1.5",
  _highlighted: {
    bg: "ink/5",
    // a short accent bar marks the row the keyboard is on
    _before: {
      content: '""',
      position: "absolute",
      insetBlock: "2",
      insetInlineStart: "0",
      w: "2px",
      rounded: "full",
      bg: "primary",
    },
  },
})

export const trail = css({
  flexShrink: "1",
  minW: "0",
  maxW: "40%",
  color: "ink.muted",
  truncate: true,
})

export const chevron = css({
  flexShrink: "0",
  boxSize: "3.5",
  color: "ink.muted",
  opacity: "0.6",
})

export const itemTitle = css({
  flex: "1",
  minW: "0",
  fontWeight: "medium",
  truncate: true,
})

export const mark = css({
  bg: "transparent",
  color: "primary",
  fontWeight: "semibold",
})

export const status = css({
  px: "5",
  py: "8",
  textAlign: "center",
  fontSize: "14px",
  color: "ink.muted",
  "& strong": { display: "block", color: "ink", fontWeight: "medium", mb: "1" },
})
