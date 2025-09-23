import { styled } from "styled-system/jsx"

export const Code = styled("code", {
  base: {
    whiteSpace: "nowrap",
    bg: "bg.code.inline",
    rounded: "xs",
    py: "0.5",
    px: "1",
    mx: "0.1em",
    fontSize: "0.84em",
    fontFamily: "mono",
    fontWeight: "semibold",
    color: { base: "pink.600", _dark: "pink.400" },
  },
})
