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
