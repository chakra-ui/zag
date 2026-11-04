import { css } from "styled-system/css"
import { container as column } from "theme/layout"

export const container = css({ ...column, pb: "32" })

export const header = css({
  display: "flex",
  flexDirection: { base: "column", md: "row" },
  alignItems: { base: "flex-start", md: "flex-end" },
  justifyContent: "space-between",
  gap: "6",
  pt: { base: "16", md: "24" },
  pb: { base: "10", md: "14" },
})

export const copy = css({
  display: "flex",
  flexDirection: "column",
  gap: "4",
  maxW: "640px",
})

export const title = css({
  fontSize: "clamp(32px, 4vw, 48px)",
  lineHeight: "1.1",
  fontWeight: "medium",
  letterSpacing: "-0.035em",
  textWrap: "balance",
  color: "ink",
})

export const lead = css({
  fontSize: "17px",
  lineHeight: "1.65",
  color: "ink.muted",
  textWrap: "pretty",
})
