import { css, cva, keyframes } from "styled-system/css"
import { bentoRaw, darkPanel, dialogRaw, ease, menu } from "./bento.css"
import { h2Raw } from "./home.css"

const keycapShadow =
  "0 0 0 1px {colors.line}, inset 0 -4px 0 {colors.line.edge}, 0 10px 18px -12px rgba(0, 0, 0, 0.45)"

const keyPress = keyframes({
  "0%, 21%, 27%, 46%, 52%, 71%, 77%, 91%, 97%, 100%": {
    transform: "translateY(0)",
    boxShadow: keycapShadow,
  },
  "23%, 48%, 73%, 93%": {
    transform: "translateY(3px)",
    boxShadow:
      "0 0 0 1px {colors.line}, inset 0 -1px 0 {colors.line.edge}, 0 4px 8px -6px rgba(0, 0, 0, 0.45)",
  },
})

const keyTap = keyframes({
  "0%, 36%, 44%, 100%": { transform: "translateY(0)" },
  "40%": { transform: "translateY(3px)" },
})

const eventBlink = keyframes({
  "0%, 21%, 30%, 46%, 55%, 71%, 80%, 91%, 100%": { opacity: "0.35" },
  "23%, 28%, 48%, 53%, 73%, 78%, 93%, 98%": { opacity: "1" },
})

const showDown = keyframes({
  "0%, 60%": { opacity: "1" },
  "61%, 99%": { opacity: "0" },
})

const showUp = keyframes({
  "0%, 60%": { opacity: "0" },
  "61%, 99%": { opacity: "1" },
})

const stateCycle = keyframes({
  "0%, 20%": { transform: "translateY(0)" },
  "25%, 45%": { transform: "translateY(40px)" },
  "50%, 70%": { transform: "translateY(80px)" },
  "75%, 95%": { transform: "translateY(120px)" },
  "100%": { transform: "translateY(0)" },
})

const calloutPop = keyframes({
  "0%, 10%": { opacity: "0" },
  "25%, 85%": { opacity: "1" },
  "100%": { opacity: "0" },
})

const focusMove = keyframes({
  "0%, 42%": { transform: "translateX(0)", width: "80px" },
  "50%, 92%": { transform: "translateX(80px)", width: "74px" },
  "100%": { transform: "translateX(0)", width: "80px" },
})

const announceType = keyframes({
  "0%, 8%": { maxWidth: "0" },
  "45%, 88%": { maxWidth: "320px" },
  "100%": { maxWidth: "0" },
})

export const heading = css(h2Raw, { maxWidth: "560px" })

export const grid = css(bentoRaw, { mt: "48px" })

// Keys do the right thing

export const keysScene = css({
  display: "flex",
  alignItems: "center",
  gap: "36px",
})

export const keyStack = css({ position: "relative", display: "flex" })

export const keycap = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "64px",
    height: "64px",
    px: "14px",
    rounded: "16px",
    font: "500 24px {fonts.body}",
    color: "ink",
    bgImage: "linear-gradient({colors.surface}, {colors.canvas})",
    boxShadow: keycapShadow,
  },
  variants: {
    size: {
      md: {},
      sm: {
        minWidth: "46px",
        height: "46px",
        rounded: "12px",
        fontSize: "17px",
      },
    },
    animation: {
      none: {},
      press: { animation: `${keyPress} 6s ease infinite` },
      tap: { animation: `${keyTap} 5s ease infinite` },
    },
  },
  defaultVariants: { size: "md", animation: "none" },
})

export const eventChip = css({
  position: "absolute",
  top: "calc(100% + 14px)",
  left: "50%",
  translate: "-50% 0",
  whiteSpace: "nowrap",
  py: "5px",
  px: "10px",
  rounded: "full",
  font: "500 12px {fonts.mono}",
  color: "primary",
  bg: "primary.soft",
  boxShadow: "inset 0 0 0 1px {colors.primary/40}",
  animation: `${eventBlink} 6s ease infinite`,
})

// Stacks the down/up labels in one cell so they swap in place
export const direction = css({ display: "inline-grid" })

export const directionDown = css({
  gridArea: "1 / 1",
  textAlign: "center",
  animation: `${showDown} 6s step-end infinite`,
})

export const directionUp = css({
  gridArea: "1 / 1",
  textAlign: "center",
  opacity: "0",
  animation: `${showUp} 6s step-end infinite`,
})

// No impossible states

export const states = css({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  width: "170px",
  p: "6px",
  bg: "surface",
  rounded: "14px",
  boxShadow: "0 0 0 1px {colors.line}, 0 20px 40px -24px rgba(0, 0, 0, 0.45)",
})

export const stateRow = css({
  position: "relative",
  zIndex: "1",
  display: "flex",
  alignItems: "center",
  height: "34px",
  pl: "28px",
  pr: "12px",
  font: "400 13px {fonts.mono}",
  color: "ink",
})

export const stateIndicator = css({
  position: "absolute",
  insetX: "6px",
  top: "6px",
  height: "34px",
  rounded: "9px",
  bg: "primary.soft",
  boxShadow: "inset 0 0 0 1px {colors.primary/50}",
  animation: `${stateCycle} 8s ${ease} infinite`,
  _before: {
    content: '""',
    position: "absolute",
    left: "12px",
    top: "50%",
    boxSize: "7px",
    mt: "-3.5px",
    rounded: "full",
    bg: "primary.solid",
    boxShadow: "0 0 0 3px {colors.primary.solid/25}",
  },
})

// Anatomy

export const select = css({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  width: "260px",
  pr: "72px",
})

export const selectLabel = css({
  fontSize: "13px",
  fontWeight: "500",
  color: "ink.muted",
})

export const selectTrigger = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "38px",
  px: "12px",
  rounded: "10px",
  bg: "surface",
  boxShadow: "0 0 0 1px {colors.line}, 0 1px 2px rgba(0, 0, 0, 0.05)",
  fontSize: "14px",
  color: "ink",
})

export const selectContent = css({
  display: "flex",
  flexDirection: "column",
  p: "5px",
  rounded: "12px",
  bg: "surface",
  boxShadow: "0 0 0 1px {colors.line}, 0 18px 36px -20px rgba(0, 0, 0, 0.45)",
  fontSize: "14px",
})

export const selectItem = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "32px",
  px: "10px",
  rounded: "8px",
  color: "ink",
  _selected: { bg: "primary.soft", color: "primary" },
})

export const callout = cva({
  base: {
    position: "absolute",
    right: "0",
    py: "3px",
    px: "8px",
    rounded: "6px",
    font: "500 11px {fonts.mono}",
    color: "primary.solidInk",
    bg: "primary.solid",
    animation: `${calloutPop} 6s ease infinite`,
    // Leader line to the part it names
    _before: {
      content: '""',
      position: "absolute",
      right: "100%",
      top: "50%",
      width: "22px",
      height: "1.5px",
      bg: "primary.solid",
    },
  },
  variants: {
    part: {
      trigger: { top: "34px" },
      content: { top: "92px", animationDelay: "0.4s" },
      item: { top: "150px", animationDelay: "0.8s" },
    },
  },
})

// Keyboard

export const typeaheadScene = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "18px",
})

export const typeaheadKeys = css({ display: "flex", gap: "8px" })

export const typeaheadMenu = css(menu.raw({ size: "compact" }), {
  width: "180px",
})

// Focus

export const dialog = css(dialogRaw)

export const dialogTitle = css({ fontWeight: "600", fontSize: "15px" })

export const dialogText = css({ fontSize: "13px", color: "ink.muted" })

export const dialogActions = css({
  position: "relative",
  display: "flex",
  gap: "8px",
  mt: "14px",
})

export const focusRing = css({
  position: "absolute",
  left: "-4px",
  top: "-4px",
  width: "80px",
  height: "40px",
  rounded: "12px",
  boxShadow: "0 0 0 2.5px {colors.primary.solid}",
  pointerEvents: "none",
  animation: `${focusMove} 5s ${ease} infinite`,
})

// Screen readers

export const announceScene = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: "40px",
})

export const voiceOver = css({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minWidth: "330px",
  py: "14px",
  px: "20px",
  rounded: "14px",
  bg: darkPanel,
  color: "#eaf5ee",
  boxShadow: "0 24px 48px -24px rgba(0, 0, 0, 0.6)",
  fontSize: "17px",
})

export const voiceOverIcon = css({ color: "primary.solid", flex: "0 0 auto" })

export const voiceOverText = css({
  display: "inline-block",
  maxWidth: "100%",
  overflow: "hidden",
  whiteSpace: "nowrap",
  borderRight: "2px solid {colors.primary.solid}",
  animation: `${announceType} 6s steps(28) infinite`,
})
