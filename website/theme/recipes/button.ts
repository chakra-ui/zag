import { defineRecipe } from "@pandacss/dev"

export const button = defineRecipe({
  className: "button",
  description: "Page actions: solid for the primary action, outline next to it",
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2",
    h: "10",
    px: "4",
    rounded: "md",
    fontSize: "14px",
    fontWeight: "medium",
    whiteSpace: "nowrap",
    borderWidth: "1px",
    borderColor: "transparent",
    transitionProperty: "background, border-color, color, transform",
    transitionDuration: "fast",
    transitionTimingFunction: "ease-out",
    focusVisibleRing: "outside",
    _hover: { transform: "translateY(-1px)" },
    _active: { transform: "translateY(0)" },
    _motionReduce: { _hover: { transform: "none" } },
  },
  variants: {
    variant: {
      solid: {
        bg: "fg",
        color: "bg.page",
        _hover: { bg: "fg.muted" },
      },
      outline: {
        borderColor: { base: "border", _dark: "border.strong" },
        color: "fg",
        _hover: { borderColor: "fg.subtle" },
      },
    },
  },
  defaultVariants: { variant: "outline" },
})
