import { defineRecipe } from "@pandacss/dev"

const button = defineRecipe({
  name: "button",
  description: "A button styles",
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "start",
    cursor: "pointer",
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "blue.600",
    },
  },
  variants: {
    size: {
      sm: {
        fontWeight: "medium",
        px: "4",
        py: "1",
      },
      md: {
        minWidth: "180px",
        fontWeight: "semibold",
        fontSize: "lg",
        height: "14",
      },
    },
    variant: {
      green: {
        bg: { base: "bg-primary-subtle", _hover: "bg-primary-bold" },
        color: "white",
      },
      outline: {
        bg: "bg-subtle",
        borderWidth: "1px",
        _hover: {
          "&:enabled": {
            bg: "bg-bold",
          },
        },
      },
      black: {
        bg: { base: "bg-secondary-subtle", _hover: "bg-secondary-bold" },
        color: "white",
      },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
})

export const recipes = {
  button,
}
