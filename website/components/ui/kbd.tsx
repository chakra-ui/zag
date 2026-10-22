import { styled } from "styled-system/jsx"

export const Kbd = styled("kbd", {
  base: {
    fontFamily: "mono",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minW: "6",
    h: "6",
    px: "1.5",
    fontSize: "12px",
    lineHeight: "1",
    letterSpacing: "0.02em",
    bg: "bg",
    color: "text.bold",
    borderWidth: "1px",
    borderBottomWidth: "2px",
    borderColor: "border.bold",
    rounded: "sm",
    whiteSpace: "nowrap",
  },
})
