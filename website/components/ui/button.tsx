import Link from "next/link"
import { cva } from "styled-system/css"
import { styled } from "styled-system/jsx"

const buttonRecipe = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "start",
    cursor: "pointer",
    focusVisibleRing: "outside",
    focusRingColor: "blue.600",
  },
  variants: {
    variant: {
      green: {
        bg: "bg.primary.subtle",
        color: "white",
        _hover: {
          bg: "bg.primary.bold",
        },
      },
      outline: {
        bg: "bg.subtle",
        borderWidth: "1px",
        borderColor: "border",
        _hover: {
          "&:enabled": {
            bg: "bg.bold",
          },
        },
      },
      black: {
        bg: "bg.secondary.subtle",
        color: "white",
        _hover: {
          bg: "bg.secondary.bold",
        },
      },
    },
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
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
  },
})

export const Button = styled("button", buttonRecipe)

export const ButtonLink = styled(Link, buttonRecipe)
