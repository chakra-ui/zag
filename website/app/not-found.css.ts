import { css } from "styled-system/css"
import { container } from "theme/layout"

export const main = css({
  ...container,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  pt: { base: "20", md: "28" },
  pb: { base: "24", md: "32" },
})

// a tiny state machine: the visit ends in a state that doesn't exist
export const machine = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  mb: "10",
  fontFamily: "mono",
  fontSize: "13px",
  fontWeight: "semibold",
})

export const state = css({
  display: "inline-flex",
  alignItems: "center",
  h: "9",
  px: "4",
  rounded: "full",
  bg: "ink/6",
  color: "ink.muted",
})

export const missing = css({
  display: "inline-flex",
  alignItems: "center",
  h: "9",
  px: "4",
  rounded: "full",
  bg: { base: "#db2777", _dark: "#f472b6" },
  color: { base: "white", _dark: "#0f1211" },
  boxShadow: "0 6px 20px -8px color-mix(in srgb, #db2777 60%, transparent)",
})

export const edge = css({
  display: "flex",
  alignItems: "center",
  gap: "1",
  color: "ink.muted",
  fontSize: "11px",
  fontWeight: "normal",
  "& svg": { boxSize: "3.5" },
})

export const code = css({
  fontFamily: "mono",
  fontSize: "13px",
  color: "ink.muted",
  mb: "3",
})

export const title = css({
  maxW: "18ch",
  fontSize: "clamp(32px, 4.4vw, 48px)",
  lineHeight: "1.1",
  fontWeight: "medium",
  letterSpacing: "-0.035em",
  textWrap: "balance",
  color: "ink",
})

export const lead = css({
  mt: "4",
  maxW: "46ch",
  fontSize: "17px",
  lineHeight: "1.65",
  color: "ink.muted",
})

export const actions = css({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "3",
  mt: "10",
})

export const hint = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  mt: "6",
  fontSize: "14px",
  color: "ink.muted",
})

export const kbd = css({
  px: "1.5",
  rounded: "md",
  bg: "ink/6",
  fontFamily: "mono",
  fontSize: "12px",
  color: "ink",
})
