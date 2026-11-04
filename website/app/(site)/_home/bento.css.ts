import { css, cva, keyframes } from "styled-system/css"

const danger = "#d92d20"
export const darkPanel = "#101412"
export const ease = "cubic-bezier(0.6, 0.1, 0.2, 1)"

const highlightCycle = keyframes({
  "0%, 20%": { transform: "translateY(0)" },
  "25%, 45%": { transform: "translateY(100%)" },
  "50%, 70%": { transform: "translateY(200%)" },
  "75%, 90%": { transform: "translateY(100%)" },
  "95%, 100%": { transform: "translateY(0)" },
})

const highlightTypeahead = keyframes({
  "0%, 35%": { transform: "translateY(0)" },
  "45%, 90%": { transform: "translateY(200%)" },
  "100%": { transform: "translateY(0)" },
})

const highlightStep = keyframes({
  "0%, 30%": { transform: "translateY(0)" },
  "36%, 63%": { transform: "translateY(100%)" },
  "70%, 96%": { transform: "translateY(200%)" },
  "100%": { transform: "translateY(0)" },
})

// Grid

export const bentoRaw = css.raw({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "16px",
  "@media (max-width: 960px)": { gridTemplateColumns: "minmax(0, 1fr)" },
})

export const tile = cva({
  base: {
    display: "flex",
    flexDirection: "column",
    minWidth: "0",
    bg: "surface",
    rounded: "22px",
    boxShadow: "0 0 0 1px {colors.line}",
    overflow: "hidden",
  },
  variants: {
    span: {
      1: {},
      2: {
        gridColumn: "span 2",
        "@media (max-width: 960px)": { gridColumn: "auto" },
      },
      3: {
        gridColumn: "span 3",
        "@media (max-width: 960px)": { gridColumn: "auto" },
      },
    },
  },
  defaultVariants: { span: 1 },
})

export const canvas = css({
  position: "relative",
  height: "260px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  p: "24px",
  bg: "radial-gradient(90% 100% at 50% 0%, color-mix(in srgb, {colors.primary.solid} 14%, {colors.surface}) 0%, {colors.surface} 70%)",
  borderBottom: "1px solid {colors.line}",
  overflow: "hidden",
  // Dot grid
  _before: {
    content: '""',
    position: "absolute",
    inset: "0",
    bgImage: "radial-gradient({colors.ink/10} 1px, transparent 1px)",
    bgSize: "18px 18px",
    maskImage: "radial-gradient(70% 70% at 50% 40%, #000, transparent)",
    pointerEvents: "none",
  },
  // Lifts the illustration above the dot grid
  "& > *": {
    position: "relative",
    "@media (max-width: 960px)": { transform: "scale(0.86)" },
  },
  "@media (max-width: 960px)": { height: "240px" },
})

export const tileBody = css({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  pt: "22px",
  px: "26px",
  pb: "26px",
})

export const tileTitle = css({ fontSize: "16px", fontWeight: "500" })

export const tileDesc = css({
  fontSize: "15px",
  lineHeight: "1.55",
  color: "ink.muted",
})

// Shared illustration parts

export const arrow = css({ color: "line.strong" })

export const menu = cva({
  base: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "240px",
    p: "6px",
    bg: "surface",
    rounded: "14px",
    boxShadow:
      "0 0 0 1px {colors.line}, 0 1px 2px rgba(0, 0, 0, 0.05), 0 20px 40px -22px rgba(0, 0, 0, 0.45)",
    fontSize: "14px",
    color: "ink",
  },
  variants: {
    size: {
      md: {},
      compact: { width: "170px" },
      mini: { width: "96px", p: "4px", fontSize: "12px" },
    },
  },
  defaultVariants: { size: "md" },
})

export const menuItem = cva({
  base: {
    position: "relative",
    zIndex: "1",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    height: "36px",
    px: "10px",
    color: "ink",
    "& svg": { color: "ink.muted" },
  },
  variants: {
    mini: { true: { height: "26px", px: "8px" } },
    danger: { true: { color: danger, "& svg": { color: "inherit" } } },
  },
})

export const menuLabel = css({ flex: "1" })

export const menuKbd = css({
  font: "400 12px {fonts.mono}",
  color: "ink.muted",
})

export const menuHighlight = cva({
  base: {
    position: "absolute",
    insetX: "6px",
    top: "6px",
    height: "36px",
    rounded: "9px",
    bg: "primary.soft",
    boxShadow: "inset 0 0 0 1px {colors.primary/45}",
    transition: "transform 0.4s",
  },
  variants: {
    mini: {
      true: { insetX: "4px", top: "4px", height: "26px", rounded: "7px" },
    },
    // Static row for menus that don't animate
    selected: {
      1: { transform: "translateY(100%)" },
      2: { transform: "translateY(200%)" },
    },
    animation: {
      none: {},
      cycle: { animation: `${highlightCycle} 6s ${ease} infinite` },
      typeahead: { animation: `${highlightTypeahead} 5s ${ease} infinite` },
      step: { animation: `${highlightStep} 6s ${ease} infinite` },
    },
  },
  defaultVariants: { animation: "none" },
})

export const dialogRaw = css.raw({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  width: "230px",
  p: "18px",
  rounded: "16px",
  bg: "surface",
  boxShadow: "0 0 0 1px {colors.line}, 0 24px 48px -24px rgba(0, 0, 0, 0.5)",
})

export const dialogButton = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    height: "32px",
    px: "14px",
    rounded: "9px",
    fontSize: "13px",
    fontWeight: "500",
    color: "ink",
    bg: "surface",
    boxShadow: "0 0 0 1px {colors.line}",
  },
  variants: {
    danger: { true: { bg: danger, color: "white", boxShadow: "none" } },
  },
})
