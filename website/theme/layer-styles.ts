import { type SystemStyleObject } from "@chakra-ui/system"

const contain: SystemStyleObject = {
  maxW: "8xl",
  mx: "auto",
  px: { base: "4", sm: "6", md: "8" },
}

const blockquote: SystemStyleObject = {
  marginY: "5",
  paddingX: "4",
  paddingY: "3",
  bg: "bg-tertiary-subtle",
  borderWidth: "1px",
  borderLeftColor: "border-primary-subtle",
  borderLeftWidth: "2px",
  rounded: "4px",
}

const inlineCode: SystemStyleObject = {
  whiteSpace: "nowrap",
  bg: "bg-code-inline",
  rounded: "base",
  paddingY: "0.5",
  paddingX: "1",
  fontSize: "14px",
  fontFamily: "mono",
  fontWeight: "semibold",
  color: "pink.600",
  _dark: { color: "pink.400" },
}

export const layerStyles: Record<string, any> = {
  contain,
  blockquote,
  inlineCode,
}
