import { sva } from "styled-system/css"

// always dark, so it reads the same on both themes
export const postCover = sva({
  slots: ["root", "mark", "label", "glyph", "foot"],
  base: {
    root: {
      position: "relative",
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gridTemplateRows: "auto 1fr",
      gap: "6",
      overflow: "hidden",
      bg: "#0d100f",
      bgImage:
        "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.12) 1px, transparent 0)",
      bgSize: "18px 18px",
      color: "#e6eae7",
    },
    mark: {
      display: "grid",
      placeItems: "center",
      rounded: "xl",
      bg: "primary.solid",
      color: "primary.solidInk",
      "& svg": { w: "62%", h: "auto" },
    },
    label: {
      justifySelf: "end",
      fontWeight: "medium",
      color: "primary.solid",
    },
    glyph: {
      alignSelf: "end",
      fontWeight: "semibold",
      lineHeight: "0.82",
      letterSpacing: "-0.06em",
      color: "primary.solid",
    },
    foot: {
      alignSelf: "end",
      justifySelf: "end",
      color: "#8e9792",
    },
  },
  variants: {
    size: {
      lg: {
        root: {
          aspectRatio: "16/8",
          p: { base: "6", md: "12" },
          rounded: "20px",
          boxShadow: "0 0 0 1px {colors.line}",
        },
        mark: { boxSize: { base: "10", md: "14" } },
        label: { fontSize: { base: "13px", md: "15px" } },
        glyph: { fontSize: { base: "110px", md: "200px" } },
        foot: { fontSize: { base: "13px", md: "14px" } },
      },
      md: {
        root: { h: "full", minH: "260px", p: { base: "6", md: "9" } },
        mark: { boxSize: "11" },
        label: { fontSize: "13px" },
        glyph: { fontSize: { base: "120px", md: "140px" } },
        foot: { fontSize: "13px" },
      },
    },
  },
  defaultVariants: { size: "lg" },
})
