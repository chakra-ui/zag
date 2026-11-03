import { css } from "styled-system/css"
import { buttonSolidRaw, frameworkTabRaw, h2Raw, ledeRaw } from "./home.css"

export const startSection = css({ py: "128px 96px" })

export const finale = css({
  position: "relative",
  overflow: "hidden",
  display: "grid",
  gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1.35fr)",
  gap: "40px",
  alignItems: "center",
  p: "44px 48px",
  rounded: "28px",
  color: "#e8f0eb",
  bg: "radial-gradient(70% 90% at 0% 100%, rgba(0, 198, 94, 0.28), transparent 60%), radial-gradient(50% 60% at 100% 0%, rgba(0, 198, 94, 0.12), transparent 70%), #0e1311",
  boxShadow: "0 0 0 1px #1e2824",
  "@media (max-width: 960px)": {
    gridTemplateColumns: "minmax(0, 1fr)",
    p: "28px",
  },
  "@media (min-width: 961px)": { p: "72px 64px", gap: "56px" },
  "@media (min-width: 961px) and (max-width: 1100px)": {
    gridTemplateColumns: "minmax(0, 1fr)",
    p: "56px",
  },
})

export const finaleMark = css({
  position: "absolute",
  right: "-80px",
  bottom: "-70px",
  width: "640px",
  color: "#00c65e",
  opacity: "0.07",
  pointerEvents: "none",
})

export const finaleCopy = css({
  position: "relative",
  zIndex: "1",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
})

export const finaleH2 = css(h2Raw, { color: "#f2f7f4", maxWidth: "380px" })

export const finaleLede = css(ledeRaw, {
  color: "#93a39a",
  mt: "4px",
  textWrap: "balance",
  "@media (min-width: 961px) and (max-width: 1100px)": { maxWidth: "440px" },
})

export const finaleCta = css(buttonSolidRaw, {
  mt: "8px",
  alignSelf: "flex-start",
})

export const term = css({
  position: "relative",
  zIndex: "1",
  minWidth: "0",
  rounded: "16px",
  bg: "#080b0a",
  boxShadow: "0 0 0 1px #1e2824, 0 30px 60px -30px rgba(0, 0, 0, 0.8)",
  overflow: "hidden",
})

export const termBar = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  p: "6px 8px",
  borderBottom: "1px solid #18201c",
})

export const termTabs = css({ display: "flex", gap: "2px" })

// Names stay visible on desktop; narrow screens fall back to icon + selected name
export const termTab = css(frameworkTabRaw, {
  color: "#7f8e86",
  p: "0 10px 0 8px",
  "& span": { display: "inline" },
  _hover: { color: "#e8f0eb" },
  _selected: {
    color: "#f2f7f4",
    p: "0 10px 0 8px",
    bg: "whiteAlpha.100",
  },
  "@media (max-width: 640px)": { "& span": { display: "none" } },
})

export const termCopy = css({
  color: "#7f8e86",
  _hover: { color: "#f2f7f4", bg: "whiteAlpha.100" },
})

export const termCode = css({
  m: "0",
  p: "16px 18px 18px",
  font: "400 12.5px/1.85 {fonts.mono}",
  color: "#8fa097",
  overflowX: "auto",
  scrollbarWidth: "none",
})

export const termLine = css({ display: "block", minWidth: "max-content" })
