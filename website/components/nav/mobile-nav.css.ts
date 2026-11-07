import { css, keyframes } from "styled-system/css"

const sheetIn = keyframes({
  from: { opacity: "0", transform: "translateY(-8px)" },
})

const sheetOut = keyframes({
  to: { opacity: "0", transform: "translateY(-8px)" },
})

const focusRing = {
  outline: "2px solid {colors.primary}",
  outlineOffset: "-2px",
}

const gutter = { base: "4", sm: "6", md: "8" }

export const trigger = css({ hideFrom: "lg" })

export const sheet = css({
  position: "fixed",
  inset: "0",
  zIndex: "100",
  overflowY: "auto",
  overscrollBehavior: "contain",
  bg: "canvas",
  outline: "0",
  _motionSafe: {
    _open: { animation: `${sheetIn} 200ms cubic-bezier(0.2, 0.8, 0.2, 1)` },
    _closed: { animation: `${sheetOut} 140ms ease-in` },
  },
})

export const bar = css({
  position: "sticky",
  top: "0",
  zIndex: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  h: "60px",
  px: gutter,
  bg: "canvas/72",
  backdropFilter: "blur(12px) saturate(1.4)",
})

export const brand = css({ display: "flex", alignItems: "center", gap: "3" })

export const body = css({
  display: "flex",
  flexDirection: "column",
  px: gutter,
  pt: "2",
  pb: "16",
})

export const divider = css({ h: "1px", bg: "line", my: "6" })

export const primaryNav = css({ display: "flex", flexDirection: "column" })

export const primaryLink = css({
  display: "flex",
  alignItems: "center",
  h: "12",
  fontSize: "22px",
  fontWeight: "medium",
  letterSpacing: "-0.02em",
  color: "ink.muted",
  transition: "color 120ms",
  _hover: { color: "ink" },
  _focusVisible: focusRing,
  _currentPage: { color: "ink" },
})

export const sections = css({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  p: "1",
  rounded: "full",
  bg: "ink/5",
})

export const sectionTab = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1.5",
  h: "8",
  rounded: "full",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink.muted",
  cursor: "pointer",
  transition: "color 120ms, background 120ms, box-shadow 120ms",
  "& svg": { boxSize: "3.5" },
  _hover: { color: "ink" },
  _focusVisible: focusRing,
  _selected: {
    color: "ink",
    bg: "surface",
    boxShadow: "0 0 0 1px {colors.line}, 0 1px 2px rgb(0 0 0 / 0.06)",
  },
})

export const frameworkRow = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mt: "4",
  fontSize: "14px",
  color: "ink.muted",
})

// pulls the page list out by its own link padding so the labels line up with the rest
export const pages = css({ mx: "-2.5" })

export const projectLinks = css({ display: "flex", gap: "6" })

export const projectLink = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  fontSize: "15px",
  color: "ink.muted",
  transition: "color 120ms",
  _hover: { color: "ink" },
  _focusVisible: focusRing,
  "& svg": { boxSize: "4" },
})
