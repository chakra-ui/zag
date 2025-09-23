import { styled } from "styled-system/jsx"
import NextLink from "next/link"

export const Link = styled(NextLink, {
  base: {
    cursor: "pointer",
    textDecoration: "none",
    outline: "none",
    _hover: {
      textDecoration: "underline",
    },
  },
})
