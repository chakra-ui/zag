import { css, cva } from "styled-system/css"
import { focusRing, plateRaw } from "./home.css"

const ease = "cubic-bezier(0.4, 0.1, 0.2, 1)"

export const header = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "16px 40px",
  alignItems: "flex-end",
  justifyContent: "space-between",
})

export const intro = css({
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  maxWidth: "560px",
})

export const toolTabs = css({ display: "flex", flexWrap: "wrap", gap: "4px" })

export const toolTab = css({
  appearance: "none",
  border: "0",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  px: "14px",
  py: "8px",
  rounded: "full",
  bg: "transparent",
  color: "ink.muted",
  font: "500 14px {fonts.body}",
  _selected: {
    bg: "surface",
    color: "ink",
    boxShadow: "0 0 0 1px {colors.line}",
  },
  _focusVisible: focusRing,
})

export const toolLogo = cva({
  base: { display: "block", boxSize: "16px", objectFit: "contain" },
  variants: {
    // Monochrome artwork is black
    mono: { true: { _dark: { filter: "invert(1)" } } },
  },
})

export const toolLabel = css({
  display: "flex",
  alignItems: "center",
  gap: "6px",
})

export const toolName = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
})

export const stage = css({ mt: "36px" })

export const panel = css({
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1.25fr) 32px minmax(0, 1.2fr) 32px minmax(0, 0.8fr)",
  alignItems: "stretch",
  p: "28px",
  rounded: "24px",
  bg: "surface",
  boxShadow: "0 0 0 1px {colors.line}",
  "@media (max-width: 960px)": {
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "20px",
  },
})

export const column = css({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  minWidth: "0",
})

export const plate = cva({
  base: { ...plateRaw, minHeight: "230px", p: "0", gap: "0" },
  variants: {
    tone: {
      // Code plates stay dark in both themes
      code: {
        bg: "#101412",
        boxShadow: "0 0 0 1px #1f2623, 0 16px 32px -20px rgba(0, 0, 0, 0.5)",
      },
      output: {
        justifyContent: "center",
        p: "24px",
        bg: "surface",
        bgImage:
          "radial-gradient(90% 100% at 50% 0%, {colors.primary.solid/16} 0%, transparent 75%)",
      },
    },
  },
})

export const code = css({
  m: "0",
  py: "18px",
  font: "400 12.5px/1.85 {fonts.mono}",
  color: "#8fa097",
  whiteSpace: "pre",
  overflowX: "auto",
  scrollbarWidth: "none",
  _scrollbar: { display: "none" },
})

export const line = cva({
  base: {
    display: "block",
    px: "18px",
    minWidth: "max-content",
    borderLeft: "2px solid transparent",
    transition: "background 0.4s, color 0.4s",
  },
  variants: {
    active: {
      true: {
        bg: "primary.solid/16",
        color: "#e6f5ec",
        borderLeftColor: "primary.solid",
        "--tk-punct": "#9db1a6",
      },
    },
  },
})

export const attrs = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "6px",
  px: "18px",
  pb: "18px",
  mt: "auto",
})

export const pill = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    px: "8px",
    py: "3px",
    rounded: "6px",
    font: "400 12px {fonts.mono}",
    color: "#8fa097",
    bg: "#18201c",
    boxShadow: "0 0 0 1px #26302b",
    transition: "background 0.4s, color 0.4s, box-shadow 0.4s",
  },
  variants: {
    active: {
      true: {
        color: "#7df0b0",
        bg: "primary.solid/18",
        boxShadow: "0 0 0 1px {colors.primary.solid/50}",
      },
    },
  },
})

export const slider = css({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  width: "100%",
})

export const sliderLabel = css({
  display: "flex",
  justifyContent: "space-between",
  fontWeight: "500",
})

export const sliderValue = css({
  fontVariantNumeric: "tabular-nums",
  color: "ink.muted",
})

// --value is the slider position, set inline from the current step
export const sliderTrack = css({
  position: "relative",
  height: "6px",
  rounded: "full",
  bg: "line",
})

export const sliderRange = css({
  position: "absolute",
  insetBlock: "0",
  left: "0",
  width: "var(--value)",
  rounded: "full",
  bg: "primary",
  transition: `width 0.8s ${ease}`,
})

export const sliderThumb = css({
  position: "absolute",
  top: "-9px",
  left: "var(--value)",
  boxSize: "24px",
  ml: "-12px",
  rounded: "full",
  bg: "white",
  boxShadow: "0 0 0 2px {colors.ink}, 0 4px 10px -4px rgba(0, 0, 0, 0.4)",
  transform: "scale(1)",
  transition: `transform 0.35s cubic-bezier(0.3, 0.7, 0.2, 1), left 0.8s ${ease}`,
  _dragging: { transform: "scale(1.15)" },
})
