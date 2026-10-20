import { styled } from "styled-system/jsx"

/** Bordered frame shared by the API, data attribute, CSS variable and keyboard tables */
export const DocTable = styled("div", {
  base: {
    my: "6",
    borderWidth: "1px",
    borderColor: "border",
    rounded: "md",
    overflow: "hidden",
    fontSize: "sm",
  },
})

/** Mono header row */
export const DocTableHead = styled("div", {
  base: {
    display: "grid",
    columnGap: "6",
    px: "4",
    py: "2",
    bg: "bg.code.inline",
    borderBottomWidth: "1px",
    borderColor: "border",
    fontFamily: "mono",
    fontSize: "11px",
    fontWeight: "medium",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "text.muted",
  },
})

/** Two columns from `sm` up, stacked on phones */
export const DocTableRow = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: { base: "1fr", sm: "minmax(0, 2fr) minmax(0, 3fr)" },
    columnGap: "6",
    rowGap: "1.5",
    alignItems: "baseline",
    px: "4",
    py: "3",
    "& + &": { borderTopWidth: "1px", borderColor: "border.subtle" },
  },
})

/** Mono key cell: an attribute, variable or prop name */
export const DocTableKey = styled("code", {
  base: {
    fontFamily: "mono",
    fontSize: "13px",
    fontWeight: "medium",
    color: "text.bold",
    overflowWrap: "anywhere",
  },
})
