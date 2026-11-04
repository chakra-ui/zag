import { css, keyframes } from "styled-system/css"
import { ledeRaw, plateRaw } from "./home.css"

const drawmark = keyframes({ to: { strokeDashoffset: "0" } })

const flash = keyframes({
  from: { bg: "primary.soft", color: "primary" },
  to: { bg: "transparent" },
})

export const hero = css({
  pt: "56px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "22px",
  textAlign: "center",
})

export const heroMark = css({
  mb: "10px",
  "& path": {
    stroke: "primary.solid",
    strokeDasharray: "520",
    strokeDashoffset: "520",
    animation: `${drawmark} 1.6s cubic-bezier(0.4, 0.1, 0.2, 1) 0.2s forwards`,
    _motionReduce: { animation: "none", strokeDashoffset: "0" },
  },
})

export const heroTitle = css({ maxWidth: "720px" })

export const heroLede = css(ledeRaw, { maxWidth: "720px", textWrap: "balance" })

export const heroActions = css({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "10px",
  mt: "8px",
})

export const buttonGhost = css({
  bg: "transparent",
  color: "ink",
  boxShadow: "inset 0 0 0 1px {colors.line}",
})

export const stageWrap = css({
  position: "relative",
  width: "100%",
  mt: "64px",
  _before: {
    content: '""',
    position: "absolute",
    inset: "12% 8% -8%",
    bg: "radial-gradient(60% 60% at 50% 40%, {colors.primary.solid/30}, transparent 70%)",
    filter: "blur(30px)",
    zIndex: "0",
    pointerEvents: "none",
  },
})

export const stage = css({
  position: "relative",
  zIndex: "1",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 40px minmax(0, 1fr) 40px minmax(0, 1fr)",
  textAlign: "left",
  "@media (max-width: 960px)": {
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "20px",
  },
})

export const tier = css({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  minWidth: "0",
})

export const chip = css({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  py: "9px",
  px: "12px",
  rounded: "10px",
  font: "13px {fonts.mono}",
  whiteSpace: "nowrap",
  color: "ink.muted",
  bg: "surface",
  boxShadow: "0 0 0 1px {colors.line}",
  transition: "background 0.5s, color 0.5s, box-shadow 0.5s",
  "& i": {
    boxSize: "8px",
    rounded: "full",
    bg: "line",
    transition: "background 0.5s",
  },
  _current: {
    color: "ink",
    bg: "primary.soft",
    boxShadow: "0 0 0 1px {colors.primary}",
    "& i": { bg: "primary" },
  },
  _motionReduce: { transition: "none" },
})

export const evt = css({
  font: "12px {fonts.mono}",
  color: "primary",
  minHeight: "18px",
  mt: "auto",
})

// px matches a global code-line rule from the docs code blocks
export const codeLine = css({
  px: "1em",
  font: "13px/1.9 {fonts.mono}",
  color: "ink.muted",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
})

export const codeKey = css({ color: "ink" })

// Re-keyed on change so the flash replays
export const codeValue = css({
  rounded: "4px",
  px: "2px",
  transition: "background 1.2s, color 0.4s",
  animation: `${flash} 1.2s ease-out`,
  _motionReduce: { transition: "none" },
})

export const uiTrigger = css({
  alignSelf: "flex-start",
  py: "9px",
  px: "14px",
  rounded: "10px",
  bg: "ink",
  color: "canvas",
  fontSize: "14px",
  fontWeight: "500",
})

export const uiMenu = css({
  bg: "surface",
  rounded: "12px",
  boxShadow: "0 0 0 1px {colors.line}, 0 14px 30px -18px rgba(0, 0, 0, 0.35)",
  p: "5px",
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  transformOrigin: "top left",
  transition: "opacity 0.45s, transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)",
  _closed: { opacity: "0", transform: "scale(0.96) translateY(-4px)" },
  "&[data-state=half]": { opacity: "0.55", transform: "scale(0.98)" },
  _motionReduce: { transition: "none" },
})

export const uiItem = css({
  py: "8px",
  px: "10px",
  rounded: "8px",
  fontSize: "14px",
  transition: "background 0.35s, color 0.35s",
  _highlighted: { bg: "primary.soft", color: "primary" },
})

export const partsPlate = css(plateRaw, { gap: "2px" })

// Pins the focus row to the bottom of the parts plate
export const focusLine = css({ mt: "auto" })
