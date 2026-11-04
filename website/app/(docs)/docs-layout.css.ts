import { css } from "styled-system/css"
import { wideContainer } from "theme/layout"

// header row (60px) + sections row (44px + 1px border)
const headerHeight = "105px"

const stickyColumn = {
  position: "sticky",
  top: { base: "60px", lg: headerHeight },
  h: { base: "calc(100dvh - 60px)", lg: `calc(100dvh - ${headerHeight})` },
} as const

export const shell = css({
  display: "grid",
  gridTemplateColumns: {
    base: "minmax(0, 1fr)",
    lg: "260px minmax(0, 1fr)",
    xl: "260px minmax(0, 1fr) 232px",
  },
  columnGap: { lg: "10", xl: "12" },
  ...wideContainer,
})

export const sidebar = css({ ...stickyColumn, hideBelow: "lg" })

export const toc = css({ ...stickyColumn, hideBelow: "xl" })

export const scroll = css({
  h: "full",
  overflowY: "auto",
  overscrollBehavior: "contain",
  scrollbarWidth: "none",
})

export const main = css({
  minW: "0",
  w: "full",
  maxW: "780px",
  mx: "auto",
  pt: "10",
  pb: "24",
  "& > p:first-of-type": { textStyle: "lead", color: "ink", mt: "0" },
})

export const header = css({
  display: "flex",
  flexDirection: "column",
  gap: "3",
  mb: "4",
})

export const crumb = css({
  display: "flex",
  alignItems: "center",
  gap: "1.5",
  fontSize: "13px",
  color: "ink.muted",
  "& [aria-current]": { color: "ink" },
})

export const titleRow = css({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "4",
})

export const title = css({
  flex: "1",
  fontSize: "36px",
  lineHeight: "1.15",
  fontWeight: "medium",
  letterSpacing: "-0.035em",
  color: "ink",
})

export const footer = css({
  borderTopWidth: "1px",
  borderColor: "line",
  py: "6",
})

export const footerInner = css(wideContainer)
