import { styled } from "styled-system/jsx"
import NextLink from "next/link"

export const Link = styled(NextLink, {
  base: {
    cursor: "pointer",
    textDecoration: "none",
    outline: "none",
    transition: "all 0.2s",
    _hover: {
      textDecoration: "underline",
    },
    _focus: {
      boxShadow: "outline",
    },
  },
})
