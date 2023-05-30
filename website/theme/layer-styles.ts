const contain = {
  value: {
    maxW: "8xl",
    mx: "auto",
    px: { base: "4", sm: "6", md: "8" },
  },
}

const blockquote = {
  value: {
    marginY: "5",
    paddingX: "4",
    paddingY: "3",
    bg: "bg-tertiary-subtle",
    borderWidth: "1px",
    borderLeftColor: "border-primary-subtle",
    borderLeftWidth: "2px",
    rounded: "4px",
  },
}

const inlineCode = {
  value: {
    whiteSpace: "nowrap",
    bg: "bg-code-inline",
    rounded: "base",
    paddingY: "0.5",
    paddingX: "1",
    fontSize: "14px",
    fontFamily: "mono",
    fontWeight: "semibold",
    color: { base: "pink.600", _dark: "pink.400" },
  },
}

export const layerStyles = {
  contain,
  blockquote,
  inlineCode,
}
