const display = {
  "2xl": {
    value: {
      fontSize: { base: "4xl", sm: "5xl", md: "7xl" },
      fontWeight: "bold",
      lineHeight: "shorter",
      letterSpacing: "tight",
    },
  },

  xl: {
    value: {
      fontSize: { base: "4xl", md: "6xl" },
      fontWeight: "bold",
      lineHeight: "shorter",
      letterSpacing: "tight",
    },
  },
  lg: {
    value: {
      fontSize: { base: "3xl", md: "4xl" },
      fontWeight: "bold",
      letterSpacing: "tight",
      lineHeight: "1.2",
    },
  },
  md: {
    value: {
      fontSize: { base: "xl", md: "2xl" },
      fontWeight: "bold",
      lineHeight: "1.4",
      letterSpacing: "tight",
    },
  },
  sm: {
    value: { fontSize: "xl", fontWeight: "semibold", lineHeight: "1.5" },
  },
  xs: {
    value: { fontWeight: "semibold", lineHeight: "1.5" },
  },
}

const text = {
  xl: {
    value: { fontSize: { base: "lg", md: "xl" }, lineHeight: "tall" },
  },
  lg: {
    value: { fontSize: "lg", lineHeight: "tall" },
  },
  md: {
    value: { fontSize: "16px", lineHeight: "24px" },
  },
  sm: {
    value: { fontSize: "14px", lineHeight: "20px" },
  },
  xs: {
    value: { fontSize: "12px", lineHeight: "18px" },
  },
}

const link = {
  value: {
    color: "green.500",
    cursor: "pointer",
    fontWeight: "medium",
    textDecoration: "underline",
    textDecorationColor: "cyan.default",
    textUnderlineOffset: "2px",
    textDecorationThickness: { base: "1px", _hover: "2px" },
  },
}

const sidebarLink = {
  value: {
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
  },
}

export const textStyles = {
  display,
  text,
  link,
  sidebarLink,
}
