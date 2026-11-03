import { css } from "styled-system/css"

export const proof = css({ pt: "80px" })

export const stats = css({
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "24px",
  "@media (max-width: 960px)": {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    rowGap: "32px",
  },
})

export const statValue = css({
  fontSize: "44px",
  fontWeight: "500",
  letterSpacing: "-0.045em",
  fontVariantNumeric: "tabular-nums",
})

export const statLabel = css({
  mt: "4px",
  fontSize: "14px",
  color: "ink.muted",
})

export const makers = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "28px",
  mt: "88px",
  "@media (max-width: 960px)": { mt: "64px" },
})

export const makersLabel = css({
  fontSize: "14px",
  color: "ink.muted",
  textAlign: "center",
})

export const makerList = css({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "22px 52px",
  maxWidth: "700px",
  "@media (max-width: 960px)": { gap: "18px 32px" },
})

export const maker = css({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "17px",
  fontWeight: "600",
  letterSpacing: "-0.02em",
  color: "ink.muted",
  transition: "color 0.2s",
  _hover: { color: "ink" },
})

export const makerTile = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
})

export const makerLogo = css({
  boxSize: "24px",
  objectFit: "contain",
  rounded: "6px",
  bg: "white",
  filter: "grayscale(1)",
  opacity: "0.7",
  transition: "filter 0.2s, opacity 0.2s",
  _groupHover: { filter: "none", opacity: "1" },
})
