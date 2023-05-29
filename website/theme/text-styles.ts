import { SystemStyleObject } from "@chakra-ui/system"

const display: Record<string, SystemStyleObject> = {
  "2xl": {
    fontSize: { base: "4xl", sm: "5xl", md: "7xl" },
    fontWeight: "bold",
    lineHeight: "shorter",
    letterSpacing: "tight",
  },

  xl: {
    fontSize: { base: "4xl", md: "6xl" },
    fontWeight: "bold",
    lineHeight: "shorter",
    letterSpacing: "tight",
  },
  lg: {
    fontSize: { base: "3xl", md: "4xl" },
    fontWeight: "bold",
    letterSpacing: "tight",
    lineHeight: "1.2",
  },
  md: {
    fontSize: { base: "xl", md: "2xl" },
    fontWeight: "bold",
    lineHeight: "1.4",
    letterSpacing: "tight",
  },
  sm: {
    fontSize: "xl",
    fontWeight: "semibold",
    lineHeight: "1.5",
  },
  xs: {
    fontWeight: "semibold",
    lineHeight: "1.5",
  },
}

const text: Record<string, SystemStyleObject> = {
  xl: {
    fontSize: { base: "lg", md: "xl" },
    lineHeight: "tall",
  },
  lg: {
    fontSize: "lg",
    lineHeight: "tall",
  },
  md: {
    fontSize: "16px",
    lineHeight: "24px",
  },
  sm: {
    fontSize: "14px",
    lineHeight: "20px",
  },
  xs: {
    fontSize: "12px",
    lineHeight: "18px",
  },
}

const link: SystemStyleObject = {
  color: "green.500",
  cursor: "pointer",
  fontWeight: "medium",
  textDecoration: "underline",
  textDecorationColor: "cyan.default",
  textDecorationThickness: "1px",
  textUnderlineOffset: "2px",
  _hover: {
    textDecorationThickness: "2px",
  },
}

const sidebarLink: SystemStyleObject = {
  display: "inline-block",
  paddingY: "1",
  transition: "color 0.2s ease-in-out",
  _hover: {
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  _activeLink: {
    textDecoration: "underline",
    textUnderlineOffset: "2px",
    fontWeight: "bold",
  },
}

export const textStyles = {
  display,
  text,
  link,
  sidebarLink,
}
