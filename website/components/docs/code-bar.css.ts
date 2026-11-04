import { css } from "styled-system/css"

// the strip above demo code: file name on the left, quiet actions on the right
export const bar = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "2",
  h: "11",
  ps: "4",
  pe: "1.5",
  borderBottomWidth: "1px",
  borderColor: "line",
})

export const file = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  fontFamily: "mono",
  fontSize: "12.5px",
  color: "ink.muted",
  "& svg": { boxSize: "3.5" },
})

export const actions = css({ display: "flex", alignItems: "center", gap: "1" })

export const action = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  h: "7",
  px: "2.5",
  rounded: "full",
  fontSize: "12.5px",
  fontWeight: "medium",
  color: "ink.muted",
  cursor: "pointer",
  transition: "background 120ms, color 120ms",
  _hover: { bg: "ink/6", color: "ink" },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "-2px",
  },
  "& svg": { boxSize: "3.5" },
  "&:hover [data-brand]": { color: "brand.stackblitz" },
})

// pushes an action to the end of a bar that has no space-between
export const end = css({ ms: "auto" })
