import { defineRecipe } from "@pandacss/dev"

export const chip = defineRecipe({
  className: "chip",
  jsx: ["Chip"],
  description: "Small status pills like live, code only and level 1",
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "1.5",
    px: "2",
    py: "0.5",
    rounded: "full",
    borderWidth: "1px",
    fontFamily: "mono",
    fontSize: "11px",
    lineHeight: "1.6",
    whiteSpace: "nowrap",
  },
  variants: {
    tone: {
      neutral: { borderColor: "border.strong", color: "fg.muted" },
      accent: {
        bg: "accent.tint",
        borderColor: "accent.line",
        color: "accent",
      },
    },
  },
  defaultVariants: { tone: "neutral" },
})

export const logoChip = defineRecipe({
  className: "logo-chip",
  description: "A logo and a name, used for frameworks in the hero",
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "1.5",
    px: "2",
    py: "1",
    rounded: "md",
    borderWidth: "1px",
    borderColor: { base: "border", _dark: "border.strong" },
    bg: { base: "white", _dark: "bg.control" },
    fontSize: "14px",
    color: "fg",
    "& img": { boxSize: "3.5" },
  },
})

export const pill = defineRecipe({
  className: "pill",
  description: "Release pill above the hero heading",
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2",
    ps: "1",
    pe: "2.5",
    py: "1",
    rounded: "full",
    borderWidth: "1px",
    borderColor: { base: "border", _dark: "border.strong" },
    bg: { base: "transparent", _dark: "bg.control" },
    fontSize: "13px",
    color: "fg.muted",
    transitionProperty: "border-color",
    transitionDuration: "fast",
    _hover: { borderColor: "accent.line" },
    "& [data-part=tag]": {
      fontFamily: "mono",
      fontSize: "11px",
      fontWeight: "medium",
      px: "1.5",
      rounded: "full",
      bg: "accent",
      color: { base: "white", _dark: "gray.950" },
    },
  },
})
