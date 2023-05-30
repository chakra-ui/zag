import { ComponentStyleConfig } from "@chakra-ui/theme"

const Button: ComponentStyleConfig = {
  baseStyle: {
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
    green: {
      bg: "bg-primary-subtle",
      color: "white",
      _hover: {
        bg: "bg-primary-bold",
      },
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
      bg: "bg-secondary-subtle",
      color: "white",
      _hover: {
        bg: "bg-secondary-bold",
      },
    },
  },
  sizes: {
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
  defaultProps: {
    size: "md",
    variant: "outline",
  },
}

export const components = {
  Button,
}
