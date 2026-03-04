import { styled } from "styled-system/jsx"

export const Kbd = styled("kbd", {
  base: {
    fontFamily: "mono",
    display: "inline-block",
    px: "0.4em",
    py: "0.1em",
    fontSize: "0.8em",
    fontWeight: "bold",
    bg: "bg.code.inline/50",
    color: { base: "pink.600", _dark: "pink.400" },
    borderWidth: "1px",
    borderBottomWidth: "2px",
    borderColor: "border.bold",
    borderRadius: "3px",
  },
})
