import { css } from "styled-system/css"

export const backdrop = css({
  position: "fixed",
  inset: "0",
  zIndex: "1000",
  bg: "rgb(0 0 0 / 0.4)",
  backdropFilter: "blur(2px)",
})

export const positioner = css({
  position: "fixed",
  inset: "0",
  zIndex: "1001",
  display: "grid",
  placeItems: "center",
  p: "4",
})

export const content = css({
  display: "flex",
  flexDirection: "column",
  w: "min(1040px, 100%)",
  maxH: "min(88dvh, 900px)",
  rounded: "2xl",
  bg: "surface",
  boxShadow: "0 0 0 1px {colors.line}, 0 24px 64px -24px rgb(0 0 0 / 0.45)",
  outline: "0",
  overflow: "hidden",
})

export const header = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  h: "14",
  px: "5",
  borderBottomWidth: "1px",
  borderColor: "line",
})

export const title = css({
  flex: "1",
  fontSize: "15px",
  fontWeight: "medium",
  color: "ink",
})

export const hint = css({
  fontSize: "13px",
  color: "ink.muted",
  hideBelow: "sm",
})

export const iconButton = css({
  display: "grid",
  placeItems: "center",
  minW: "8",
  h: "8",
  px: "1.5",
  rounded: "md",
  color: "ink.muted",
  cursor: "pointer",
  _hover: { bg: "ink/6", color: "ink" },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "-2px",
  },
  "& svg": { boxSize: "4" },
})

export const body = css({
  h: "min(72dvh, 680px)",
  minH: "0",
  bg: "canvas",
})

export const status = css({
  display: "grid",
  placeItems: "center",
  h: "full",
  fontSize: "14px",
  color: "ink.muted",
})
