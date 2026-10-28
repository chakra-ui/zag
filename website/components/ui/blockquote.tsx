import { styled } from "styled-system/jsx"

export const Blockquote = styled("blockquote", {
  base: {
    marginY: "6",
    paddingX: "4",
    paddingY: "3",
    bg: "bg.code.inline",
    borderWidth: "1px",
    borderColor: "border",
    rounded: "md",
    color: "text.subtle",
    "& > p:first-child > strong:first-child": {
      display: "block",
      mb: "1",
      fontFamily: "mono",
      fontSize: "11px",
      fontWeight: "medium",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "text.muted",
    },
  },
})
