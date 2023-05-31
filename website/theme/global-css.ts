export const globalCss = {
  "@font-face": {
    fontFamily: "'Spline Sans'",
    src: "url('/fonts/spline-sans.woff2') format('woff2')",
    fontWeight: "100 1000",
  },

  "body, html": {
    fontFamily: "Spline Sans",
    textRendering: "geometricprecision",
    textSizeAdjust: "100%",
    WebkitFontSmoothing: "antialiased",
    bg: "bg-subtle",
  },

  "*": {
    borderColor: "border-bold",
    borderStyle: "solid",
  },

  a: {
    textDecoration: "inherit",
    color: "inherit",
    background: "transparent",
  },

  ".focus-outline": {
    "&:focus, &[data-focus]": {
      outline: "2px solid hsl(204, 100%, 40%)",
    },
  },

  ".has-highlight": {
    mark: {
      color: "green.500",
      fontWeight: "semibold",
    },
  },

  table: {
    width: "100%",
    marginY: "8",
    "& th": {
      bg: "bg-bold",
    },
    "& th, & td": {
      borderWidth: "1px",
      py: "3",
      px: "5",
      textAlign: "start",
    },
  },

  mark: {
    bg: "transparent",
  },

  ".mdx-content": {
    output: {
      fontFeatureSettings: "tnum",
      fontVariantNumeric: "tabular-nums",
    },
    "& li:not([role])": {
      marginY: "1",
    },
    "& ol:not([role]), & ul:not([role], & .chakra-wrap__list)": {
      marginY: "5",
      paddingLeft: "4",
    },
    "& h2, & h3, & h4": {
      scrollMarginTop: "24",
      "&:hover": {
        "a.anchor": { opacity: 1 },
      },
      "& a:focus": { opacity: 1 },
    },
    "& p, & li:not([role])": {
      lineHeight: "tall",
    },
    "& p + p": {
      marginTop: "6",
    },
    "& a.anchor": {
      opacity: 0,
      transition: "opacity 0.2s ease-in-out",
      marginX: "3",
      "&:before": {
        content: `"#"`,
      },
    },
  },
}
