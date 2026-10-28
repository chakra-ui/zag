import { styled } from "styled-system/jsx"

export const Code = styled("code", {
  base: {
    whiteSpace: "nowrap",
    bg: "bg.code.inline",
    borderWidth: "1px",
    borderColor: "border",
    rounded: "4px",
    py: "0.05em",
    px: "0.35em",
    mx: "0.1em",
    fontSize: "0.84em",
    fontFamily: "mono",
    fontWeight: "medium",
    color: "text.bold",
  },
})
