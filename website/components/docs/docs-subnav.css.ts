import { css } from "styled-system/css"

export const root = css({
  hideBelow: "lg",
  borderBottomWidth: "1px",
  borderColor: "line",
})

export const inner = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  h: "11",
  maxW: "1440px",
  mx: "auto",
  // tabs keep their own padding, so the first label lines up with the logo
  ps: { base: "2", sm: "4", md: "6" },
  pe: { base: "4", sm: "6", md: "8" },
})

export const tabs = css({ display: "flex", alignSelf: "stretch", gap: "1" })

export const tab = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: "2",
  outline: "none",
  fontSize: "14px",
  fontWeight: "medium",
  color: "ink.muted",
  transition: "color 120ms",
  "& > span": {
    display: "flex",
    alignItems: "center",
    gap: "2",
    h: "8",
    px: "2",
    rounded: "md",
    transition: "background 120ms",
  },
  "& svg": { boxSize: "4", opacity: "0.8" },
  _hover: { color: "ink", "& > span": { bg: "ink/5" } },
  _focusVisible: {
    "& > span": {
      outline: "2px solid {colors.primary}",
      outlineOffset: "-2px",
    },
  },
  _currentPage: {
    color: "ink",
    "& svg": { opacity: "1", color: "primary" },
    _after: {
      content: '""',
      position: "absolute",
      insetX: "2",
      bottom: "-1px",
      h: "2px",
      rounded: "full",
      bg: "primary/60",
    },
  },
})

export const end = css({ display: "flex", alignItems: "center", gap: "2" })

// a filled pink heart so the ask is easy to spot
export const sponsor = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  h: "6",
  ps: "2",
  pe: "2.5",
  rounded: "full",
  fontSize: "13px",
  fontWeight: "medium",
  color: "ink",
  transition: "background 120ms",
  _hover: { bg: "color-mix(in srgb, #db2777 10%, transparent)" },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "2px",
  },
  "& svg": { boxSize: "3.5", color: { base: "#db2777", _dark: "#f472b6" } },
})
