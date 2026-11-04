import { css, keyframes } from "styled-system/css"

const pkgIn = keyframes({
  from: { opacity: "0", transform: "translateY(3px)" },
  to: { opacity: "1", transform: "none" },
})

export const install = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  width: "100%",
  maxWidth: "480px",
  mt: "12px",
  textAlign: "left",
})

export const installCmd = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  width: "100%",
  height: "46px",
  px: "16px",
  rounded: "14px",
  bg: "surface",
  boxShadow: "0 0 0 1px {colors.line}, 0 12px 28px -20px rgba(0, 0, 0, 0.35)",
})

export const installCode = css({
  font: "13.5px {fonts.mono}",
  color: "ink.muted",
  whiteSpace: "nowrap",
  overflowX: "auto",
  scrollbarWidth: "none",
})

export const installPrompt = css({ color: "primary.solid", mr: "2px" })

export const installName = css({ color: "ink" })

export const installSlot = css({ color: "ink.muted", fontStyle: "italic" })

export const installPkg = css({
  display: "inline-block",
  color: "primary",
  animation: `${pkgIn} 0.35s ease-out`,
  _motionReduce: { animation: "none" },
})

export const installTabs = css({
  display: "flex",
  justifyContent: "center",
  gap: "4px",
})
