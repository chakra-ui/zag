import { css } from "styled-system/css"
import { h2Raw, ledeRaw } from "./home.css"

export const frameworksHeader = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "16px 40px",
})

export const frameworksTitle = css(h2Raw, { maxWidth: "520px" })

export const frameworksLede = css(ledeRaw, { maxWidth: "420px" })

export const frameworkGrid = css({
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: "12px",
  mt: "40px",
  "@media (max-width: 960px)": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
})

export const frameworkCard = css({
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  minWidth: "0",
  p: "22px",
  rounded: "16px",
  bg: "surface",
  color: "ink",
  boxShadow: "0 0 0 1px {colors.line}",
})

export const frameworkName = css({ fontWeight: "500" })

export const frameworkPkg = css({
  font: "13px {fonts.mono}",
  color: "ink.muted",
})

export const logoFill = css({ fill: "primary" })

export const logoStroke = css({ stroke: "primary" })
