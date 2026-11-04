import { defineRecipe } from "@pandacss/dev"

export const docAction = defineRecipe({
  className: "doc-action",
  description:
    "Small bordered actions: resource links, copy page, playground tools",
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.5",
    h: "8",
    px: "3",
    rounded: "lg",
    borderWidth: "1px",
    borderColor: "border",
    bg: "transparent",
    fontSize: "13px",
    fontWeight: "medium",
    color: "fg.muted",
    whiteSpace: "nowrap",
    cursor: "pointer",
    transitionProperty: "color, background, border-color, scale",
    transitionDuration: "fast",
    transitionTimingFunction: "ease-out",
    _hover: { color: "fg", bg: "bg.raised", borderColor: "border.strong" },
    _active: { scale: "0.97" },
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "accent",
      outlineOffset: "2px",
    },
    _motionReduce: { _active: { scale: "1" } },
    "& svg": {
      boxSize: "3.5",
      flexShrink: "0",
      color: "accent",
      transition: "color 150ms ease-out, translate 150ms ease-out",
    },
    "& [data-part=arrow]": { color: "fg.subtle" },
    "&:hover [data-part=arrow]": {
      translate: "1px -1px",
      color: "currentColor",
    },
    "&[data-brand=stackblitz] svg:not([data-part=arrow])": {
      color: "brand.stackblitz",
    },
    "& [data-part=meta]": {
      px: "1.5",
      py: "0.5",
      rounded: "sm",
      bg: "bg.control",
      fontFamily: "mono",
      fontSize: "11px",
      fontWeight: "normal",
      color: "fg.subtle",
    },
    "& [data-part=mono]": { fontFamily: "mono", fontSize: "12px" },
  },
  variants: {
    tone: {
      neutral: {},
      accent: {
        borderColor: "accent.line",
        bg: "accent.tint",
        color: "accent",
        "& svg": { color: "accent" },
        _hover: { color: "accent", bg: "accent.tint", borderColor: "accent" },
      },
    },
    size: {
      md: {},
      sm: { h: "7", px: "2.5", fontSize: "12px", rounded: "md" },
    },
    segment: {
      true: {
        h: "full",
        rounded: "0",
        borderWidth: "0",
        _hover: { borderColor: "transparent" },
        _active: { scale: "1" },
      },
    },
    iconOnly: { true: { px: "0", w: "8" } },
  },
  defaultVariants: { tone: "neutral", size: "md" },
})
