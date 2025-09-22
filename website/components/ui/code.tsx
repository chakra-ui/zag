import { styled } from "styled-system/jsx"

export const Code = styled("code", {
  base: {
    whiteSpace: "nowrap",
    bg: "bg.code.inline",
    rounded: "base",
    paddingY: "0.5",
    paddingX: "1",
    fontSize: "14px",
    fontFamily: "mono",
    fontWeight: "semibold",
    color: { base: "pink.600", _dark: "pink.400" },
  },
})
