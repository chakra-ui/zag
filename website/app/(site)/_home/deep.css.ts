import { css, cva, keyframes } from "styled-system/css"
import { bentoRaw, darkPanel, dialogRaw, ease, menu } from "./bento.css"
import { ledeRaw } from "./home.css"

const easeOut = "cubic-bezier(0.2, 0.8, 0.2, 1)"

const caretBlink = keyframes({
  "0%, 49%": { opacity: "1" },
  "50%, 100%": { opacity: "0" },
})

const wireDraw = keyframes({
  "0%, 18%": { strokeDashoffset: "60" },
  "32%, 88%": { strokeDashoffset: "0" },
  "100%": { strokeDashoffset: "60" },
})

const dialogEnter = keyframes({
  "0%, 30%": { opacity: "0", transform: "translateY(8px) scale(0.97)" },
  "40%, 88%": { opacity: "1", transform: "none" },
  "100%": { opacity: "0", transform: "translateY(8px) scale(0.97)" },
})

const popoverEnter = keyframes({
  "0%, 28%": { opacity: "0", transform: "translateY(-6px)" },
  "38%, 86%": { opacity: "1", transform: "none" },
  "100%": { opacity: "0", transform: "translateY(-6px)" },
})

const tokenTravel = keyframes({
  "0%, 12%": { transform: "translateX(0)" },
  "32%, 46%": { transform: "translateX(110px)" },
  "66%, 84%": { transform: "translateX(232px)" },
  "100%": { transform: "translateX(0)" },
})

export const lede = css(ledeRaw, { mt: "14px" })

export const grid = css(bentoRaw, {
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  mt: "44px",
})

const columnRaw = css.raw({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
})

const rowRaw = css.raw({ display: "flex", alignItems: "center" })

export const codeChip = css({
  py: "7px",
  px: "12px",
  rounded: "9px",
  font: "400 12.5px {fonts.mono}",
  color: "#ddf3e6",
  bg: darkPanel,
})

// Write a style once

export const stylesScene = css(columnRaw, { gap: "16px" })

export const miniMenus = css({ display: "flex", gap: "10px" })

export const miniMenu = css(columnRaw, { gap: "6px" })

export const miniLabel = css({
  font: "400 11px {fonts.mono}",
  color: "ink.muted",
})

// Wire components together

export const wireScene = css(rowRaw, { gap: "22px" })

export const wireMenu = css(menu.raw({ size: "compact" }), { width: "150px" })

export const wire = css({
  strokeDasharray: "60",
  animation: `${wireDraw} 6s ease infinite`,
})

export const confirmDialog = css(dialogRaw, {
  width: "190px",
  animation: `${dialogEnter} 6s ${easeOut} infinite`,
})

export const confirmTitle = css({ fontWeight: "600", fontSize: "14px" })

export const confirmActions = css({ display: "flex", gap: "6px", mt: "12px" })

// Drive it from your code

export const controlScene = css(rowRaw, { gap: "28px" })

export const codeCard = css({
  position: "relative",
  py: "16px",
  px: "18px",
  rounded: "12px",
  font: "400 14px {fonts.mono}",
  color: "#e6eae7",
  bg: darkPanel,
  boxShadow: "0 18px 36px -20px rgba(0, 0, 0, 0.6)",
})

export const codeTrue = css({ color: "primary.solid" })

export const caret = css({
  display: "inline-block",
  width: "2px",
  height: "16px",
  ml: "3px",
  verticalAlign: "-3px",
  bg: "primary.solid",
  animation: `${caretBlink} 1.1s steps(1) infinite`,
})

export const shareStack = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "8px",
})

export const popover = css({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "180px",
  p: "14px",
  rounded: "14px",
  bg: "surface",
  boxShadow: "0 0 0 1px {colors.line}, 0 22px 44px -22px rgba(0, 0, 0, 0.5)",
  animation: `${popoverEnter} 5s ${easeOut} infinite`,
})

export const popoverTitle = css({ fontWeight: "600", fontSize: "13px" })

export const popoverInput = css({
  display: "flex",
  alignItems: "center",
  height: "30px",
  px: "10px",
  rounded: "8px",
  fontSize: "12px",
  color: "ink.muted",
  boxShadow: "0 0 0 1px {colors.line}",
})

// Write your own machine

export const machineScene = css(columnRaw, { gap: "18px" })

export const chart = css(rowRaw, { position: "relative" })

export const chartNode = cva({
  base: {
    py: "9px",
    px: "14px",
    rounded: "10px",
    font: "400 13px {fonts.mono}",
    color: "ink",
    bg: "surface",
    boxShadow: "0 0 0 1px {colors.line}, 0 10px 20px -14px rgba(0, 0, 0, 0.45)",
  },
  variants: {
    final: { true: { color: "primary", bg: "primary.soft" } },
  },
})

export const chartEdge = css({
  width: "38px",
  height: "1.5px",
  bg: "line.strong",
})

export const chartToken = css({
  position: "absolute",
  left: "34px",
  top: "-14px",
  boxSize: "10px",
  rounded: "full",
  bg: "primary.solid",
  boxShadow: "0 0 0 4px {colors.primary.solid/25}",
  animation: `${tokenTravel} 7s ${ease} infinite`,
})
