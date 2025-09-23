import { defineConfig } from "@pandacss/dev"

export default defineConfig({
  preflight: true,
  include: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./layouts/**/*.{js,jsx,ts,tsx}",
    "./demos/**/*.{js,jsx,ts,tsx}",
  ],
  exclude: [],
  jsxFramework: "react",

  theme: {
    extend: {
      tokens: {
        fonts: {
          heading: { value: "'Spline Sans', sans-serif" },
          body: { value: "'Spline Sans', sans-serif" },
          mono: {
            value:
              "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
          },
        },
        colors: {
          primary: {
            50: { value: "#f0fff4" },
            100: { value: "#c6f6d5" },
            200: { value: "#9ae6b4" },
            300: { value: "#68d391" },
            400: { value: "#48bb78" },
            500: { value: "#38a169" },
            600: { value: "#2f855a" },
            700: { value: "#276749" },
            800: { value: "#22543d" },
            900: { value: "#1a202c" },
          },
          green: {
            50: { value: "#f0fff4" },
            100: { value: "#c6f6d5" },
            200: { value: "#9ae6b4" },
            300: { value: "#68d391" },
            400: { value: "#48bb78" },
            500: { value: "#38a169" },
            600: { value: "#2f855a" },
            700: { value: "#276749" },
            800: { value: "#22543d" },
            900: { value: "#1a202c" },
          },
          gray: {
            50: { value: "#f7fafc" },
            100: { value: "#edf2f7" },
            200: { value: "#e2e8f0" },
            300: { value: "#cbd5e0" },
            400: { value: "#a0aec0" },
            500: { value: "#718096" },
            600: { value: "#4a5568" },
            700: { value: "#2d3748" },
            800: { value: "#1a202c" },
            900: { value: "#171923" },
          },
          orange: {
            50: { value: "#FFFAF0" },
            100: { value: "#FEEBC8" },
            200: { value: "#FBD38D" },
            300: { value: "#F6AD55" },
            400: { value: "#ED8936" },
            500: { value: "#DD6B20" },
            600: { value: "#C05621" },
            700: { value: "#9C4221" },
            800: { value: "#7B341E" },
            900: { value: "#652B19" },
          },
          purple: {
            50: { value: "#FAF5FF" },
            100: { value: "#E9D8FD" },
            200: { value: "#D6BCFA" },
            300: { value: "#B794F4" },
            400: { value: "#9F7AEA" },
            500: { value: "#805AD5" },
            600: { value: "#6B46C1" },
            700: { value: "#553C9A" },
            800: { value: "#44337A" },
            900: { value: "#322659" },
          },
          pink: {
            50: { value: "#FFF5F7" },
            100: { value: "#FED7E2" },
            200: { value: "#FBB6CE" },
            300: { value: "#F687B3" },
            400: { value: "#ED64A6" },
            500: { value: "#D53F8C" },
            600: { value: "#B83280" },
            700: { value: "#97266D" },
            800: { value: "#702459" },
            900: { value: "#521B41" },
          },
        },
      },
      semanticTokens: {
        colors: {
          bg: {
            DEFAULT: {
              value: { _light: "{colors.white}", _dark: "{colors.gray.900}" },
            },
            subtle: {
              value: { _light: "{colors.white}", _dark: "{colors.gray.800}" },
            },
            bold: {
              value: {
                _light: "{colors.gray.100}",
                _dark: "{colors.gray.700}",
              },
            },
            muted: {
              value: {
                _light: "{colors.gray.100}",
                _dark: "{colors.gray.700}",
              },
            },
            "primary.subtle": {
              value: "{colors.green.500}",
            },
            "primary.bold": {
              value: {
                _light: "{colors.green.600}",
                _dark: "{colors.green.400}",
              },
            },
            "secondary.subtle": {
              value: "{colors.black}",
            },
            "secondary.bold": {
              value: {
                _light: "{colors.gray.700}",
                _dark: "{colors.gray.900}",
              },
            },
            "tertiary.bold": {
              value: {
                _light: "{colors.green.100}",
                _dark: "{colors.green.900}",
              },
            },
            "tertiary.subtle": {
              value: {
                _light: "{colors.green.50}",
                _dark: "{colors.green.900}",
              },
            },
            "code.block": {
              value: {
                _light: "hsl(230, 1%, 98%)",
                _dark: "{colors.gray.900}",
              },
            },
            "code.inline": {
              value: {
                _light: "rgba(0, 0, 0, 0.1)",
                _dark: "rgba(255, 255, 255, 0.1)",
              },
            },
            header: {
              value: {
                _light: "rgba(255, 255, 255, 0.9)",
                _dark: "rgba(26, 32, 44, 0.92)",
              },
            },
            badge: {
              value: {
                _light: "{colors.orange.100}",
                _dark: "{colors.orange.900}",
              },
            },
          },
          text: {
            DEFAULT: {
              value: { _light: "{colors.gray.900}", _dark: "{colors.gray.50}" },
            },
            bold: {
              value: { _light: "{colors.gray.900}", _dark: "{colors.gray.50}" },
            },
            subtle: {
              value: {
                _light: "{colors.gray.600}",
                _dark: "{colors.gray.400}",
              },
            },
            muted: {
              value: {
                _light: "{colors.gray.600}",
                _dark: "{colors.gray.400}",
              },
            },
            "primary.bold": {
              value: {
                _light: "{colors.green.500}",
                _dark: "{colors.green.400}",
              },
            },
            inverse: {
              value: { _light: "{colors.white}", _dark: "{colors.gray.800}" },
            },
            "primary.subtle": {
              value: {
                _light: "{colors.green.600}",
                _dark: "{colors.green.400}",
              },
            },
            badge: {
              value: {
                _light: "{colors.orange.700}",
                _dark: "{colors.orange.300}",
              },
            },
          },
          border: {
            DEFAULT: {
              value: {
                _light: "{colors.gray.200}",
                _dark: "{colors.gray.700}",
              },
            },
            subtle: {
              value: {
                _light: "{colors.gray.100}",
                _dark: "{colors.gray.700}",
              },
            },
            bold: {
              value: {
                _light: "{colors.gray.200}",
                _dark: "{colors.gray.700}",
              },
            },
            "primary.subtle": {
              value: "{colors.green.500}",
            },
            "primary.bold": {
              value: {
                _light: "{colors.green.600}",
                _dark: "{colors.green.400}",
              },
            },
          },
        },
      },

      textStyles: {
        "display.2xl": {
          value: {
            fontSize: { base: "4xl", sm: "5xl", md: "7xl" },
            fontWeight: "bold",
            lineHeight: "1.25",
            letterSpacing: "-0.025em",
          },
        },
        "display.xl": {
          value: {
            fontSize: { base: "4xl", md: "6xl" },
            fontWeight: "bold",
            lineHeight: "1.25",
            letterSpacing: "-0.025em",
          },
        },
        "display.lg": {
          value: {
            fontSize: { base: "3xl", md: "4xl" },
            fontWeight: "bold",
            letterSpacing: "-0.025em",
            lineHeight: "1.2",
          },
        },
        "display.md": {
          value: {
            fontSize: { base: "xl", md: "2xl" },
            fontWeight: "bold",
            lineHeight: "1.4",
            letterSpacing: "-0.025em",
          },
        },
        "display.sm": {
          value: {
            fontSize: "xl",
            fontWeight: "semibold",
            lineHeight: "1.5",
          },
        },
        "display.xs": {
          value: {
            fontWeight: "semibold",
            lineHeight: "1.5",
          },
        },
        "text.xl": {
          value: {
            fontSize: { base: "lg", md: "xl" },
            lineHeight: "1.625",
          },
        },
        "text.lg": {
          value: {
            fontSize: "lg",
            lineHeight: "1.625",
          },
        },
        "text.md": {
          value: {
            fontSize: "16px",
            lineHeight: "24px",
          },
        },
        "text.sm": {
          value: {
            fontSize: "14px",
            lineHeight: "20px",
          },
        },
        "text.xs": {
          value: {
            fontSize: "12px",
            lineHeight: "18px",
          },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",

  globalCss: {
    body: {
      fontFamily: "body",
      textRendering: "geometricprecision",
      textSizeAdjust: "100%",
      WebkitFontSmoothing: "antialiased",
      bg: "bg.subtle",
    },

    "*": {
      borderColor: "border.bold",
      borderStyle: "solid",
    },

    ".focus-outline": {
      "&:focus, &[data-focus]": {
        outline: "2px solid hsl(204, 100%, 40%)",
      },
    },

    ".has-highlight": {
      "& mark": {
        color: "green.500",
        fontWeight: "semibold",
      },
    },

    "table:not([role])": {
      width: "100%",
      marginY: "8",
      "& th": {
        bg: "bg.bold",
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
      "& output": {
        fontFeatureSettings: "tnum",
        fontVariantNumeric: "tabular-nums",
      },
      "& li:not([role])": {
        marginY: "1",
      },
      "& ol:not([role]), & ul:not([role])": {
        marginY: "5",
        paddingLeft: "4",
      },
      "& :is(h2, h3, h4)": {
        scrollMarginTop: "24",
        "&:hover": {
          "& a.anchor": { opacity: 1 },
        },
        "& a:focus": { opacity: 1 },
      },
      "&:is(p, li:not([role]))": {
        lineHeight: "1.625",
      },
      "& p + p": {
        marginTop: "6",
      },
      "& a.anchor": {
        opacity: 0,
        transition: "opacity 0.2s ease-in-out",
        marginX: "3",
        "&::before": {
          content: `"#"`,
        },
      },
    },
  },
})
