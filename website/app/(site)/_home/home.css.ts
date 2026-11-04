import { css } from "styled-system/css"
import { container } from "theme/layout"

export const focusRing = {
  outline: "2px solid {colors.primary}",
  outlineOffset: "3px",
} as const

export const root = css({
  bg: "canvas",
  color: "ink",
  fontFamily: "body",
  fontSize: "16px",
  fontSmoothing: "antialiased",
  "& a": { _focusVisible: focusRing },
})

// Pauses an illustration's animations until LoopObserver marks it on screen
export const loop = css({
  "& *": { animationPlayState: "paused !important" },
  "&[data-playing] *": { animationPlayState: "running !important" },
  _motionReduce: { "& *": { animation: "none !important" } },
})

export const wrap = css(container)

export const section = css({ py: "128px 0" })

const heading = {
  m: "0",
  textWrap: "balance",
  fontWeight: "500",
  letterSpacing: "-0.035em",
} as const

export const h1 = css({
  ...heading,
  fontSize: "clamp(36px, 4.4vw, 54px)",
  lineHeight: "1.08",
})

export const h2Raw = css.raw({
  ...heading,
  fontSize: "clamp(28px, 3vw, 38px)",
  lineHeight: "1.15",
})
export const h2 = css(h2Raw)

export const ledeRaw = css.raw({
  m: "0",
  fontSize: "17px",
  lineHeight: "1.65",
  color: "ink.muted",
  maxWidth: "56ch",
})
export const lede = css(ledeRaw)

const buttonRaw = css.raw({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "44px",
  px: "20px",
  rounded: "full",
  border: "0",
  font: "500 15px {fonts.body}",
  textDecoration: "none",
  cursor: "pointer",
  _focusVisible: focusRing,
})
export const button = css(buttonRaw)

export const buttonSolidRaw = css.raw(buttonRaw, {
  bg: "primary.solid",
  color: "primary.solidInk",
  _hover: { bg: "primary.solidHover" },
})
export const buttonSolid = css(buttonSolidRaw)

export const tierName = css({
  fontSize: "14px",
  color: "ink.muted",
  "& b": { color: "ink", fontWeight: "500" },
})

export const plateRaw = css.raw({
  flex: "1",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  minHeight: "260px",
  boxSizing: "border-box",
  p: "22px",
  rounded: "16px",
  bg: "canvas",
  boxShadow:
    "0 0 0 1px {colors.line}, 0 5px 0 {colors.line.edge}, 0 5px 0 1px {colors.line}",
})
export const plate = css(plateRaw)

export const arrow = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "line.strong",
  "@media (max-width: 960px)": { transform: "rotate(90deg)", height: "28px" },
})

// Syntax tokens for the dark code panels; a line can retint punctuation via --tk-punct
export const token = {
  keyword: css({ color: "#c9a8ff" }),
  string: css({ color: "#8ee3b5" }),
  fn: css({ color: "#8cc8ff" }),
  tag: css({ color: "#ff9f94" }),
  attr: css({ color: "#f2c97d" }),
  prop: css({ color: "#9fd7ff" }),
  num: css({ color: "#f2c97d" }),
  punct: css({ color: "var(--tk-punct, #6e7d75)" }),
  comment: css({ color: "#5d6b63", fontStyle: "italic" }),
}

// Framework tab: icon only, the selected tab also shows its name
export const frameworkTabRaw = css.raw({
  appearance: "none",
  position: "relative",
  flex: "0 0 auto",
  minWidth: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  height: "28px",
  p: "0 7px",
  rounded: "full",
  border: "0",
  bg: "transparent",
  font: "500 12.5px {fonts.body}",
  color: "ink.muted",
  cursor: "pointer",
  transition: "color 0.2s",
  "& svg": {
    filter: "grayscale(1)",
    opacity: "0.7",
    transition: "filter 0.2s, opacity 0.2s",
  },
  "& span": { display: "none" },
  _hover: { color: "ink" },
  "&:hover:not([aria-selected=true]) svg": { opacity: "1" },
  _selected: {
    color: "ink",
    p: "0 8px 0 7px",
    "& svg": { filter: "none", opacity: "1" },
    "& span": { display: "inline" },
  },
  _focusVisible: { ...focusRing, outlineOffset: "-2px" },
})
export const frameworkTab = css(frameworkTabRaw)
