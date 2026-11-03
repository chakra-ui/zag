import { defineRecipe } from "@pandacss/dev"

export const button = defineRecipe({
  className: "button",
  description: "Page actions: solid for the primary action, outline next to it",
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2",
    h: "11",
    px: "5",
    rounded: "full",
    fontSize: "15px",
    fontWeight: "medium",
    whiteSpace: "nowrap",
    transitionProperty: "background, box-shadow, color",
    transitionDuration: "fast",
    transitionTimingFunction: "ease-out",
    _focusVisible: {
      outline: "2px solid {colors.primary}",
      outlineOffset: "3px",
    },
  },
  variants: {
    variant: {
      solid: {
        bg: "primary.solid",
        color: "primary.solidInk",
        _hover: { bg: "primary.solidHover" },
      },
      outline: {
        boxShadow: "inset 0 0 0 1px {colors.line}",
        color: "ink",
        _hover: {
          bg: "ink/4",
          boxShadow: "inset 0 0 0 1px {colors.line.strong}",
        },
      },
    },
  },
  defaultVariants: { variant: "outline" },
})
