import { defineConfig } from "@pandacss/dev"

export default defineConfig({
  preflight: true,
  include: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./layouts/**/*.{js,jsx,ts,tsx}",
    "./demos/**/*.{js,jsx,ts,tsx}",
  ],
  exclude: [],
  jsxFramework: "react",

  theme: {
    extend: {
      tokens: {
        colors: {
          // Neutral grays - minimal chroma for clean borders
          gray: {
            50: { value: "#fafafa" },
            100: { value: "#f4f4f5" },
            200: { value: "#e4e4e7" },
            300: { value: "#d4d4d8" },
            400: { value: "#a1a1aa" },
            500: { value: "#71717a" },
            600: { value: "#52525b" },
            700: { value: "#3f3f46" },
            800: { value: "#27272a" },
            900: { value: "#18181b" },
            950: { value: "#09090b" },
          },
          // Original Chakra green palette
          green: {
            50: { value: "#F0FFF4" },
            100: { value: "#C6F6D5" },
            200: { value: "#9AE6B4" },
            300: { value: "#68D391" },
            400: { value: "#48BB78" },
            500: { value: "#38A169" },
            600: { value: "#2F855A" },
            700: { value: "#276749" },
            800: { value: "#22543D" },
            900: { value: "#1C4532" },
            950: { value: "#0d2818" },
          },
          whiteAlpha: {
            50: { value: "rgba(255, 255, 255, 0.04)" },
            100: { value: "rgba(255, 255, 255, 0.06)" },
            200: { value: "rgba(255, 255, 255, 0.08)" },
            300: { value: "rgba(255, 255, 255, 0.16)" },
            400: { value: "rgba(255, 255, 255, 0.24)" },
            500: { value: "rgba(255, 255, 255, 0.36)" },
            600: { value: "rgba(255, 255, 255, 0.48)" },
            700: { value: "rgba(255, 255, 255, 0.64)" },
            800: { value: "rgba(255, 255, 255, 0.80)" },
            900: { value: "rgba(255, 255, 255, 0.92)" },
            950: { value: "rgba(255, 255, 255, 0.95)" },
          },
          blackAlpha: {
            50: { value: "rgba(0, 0, 0, 0.04)" },
            100: { value: "rgba(0, 0, 0, 0.06)" },
            200: { value: "rgba(0, 0, 0, 0.08)" },
            300: { value: "rgba(0, 0, 0, 0.16)" },
            400: { value: "rgba(0, 0, 0, 0.24)" },
            500: { value: "rgba(0, 0, 0, 0.36)" },
            600: { value: "rgba(0, 0, 0, 0.48)" },
            700: { value: "rgba(0, 0, 0, 0.64)" },
            800: { value: "rgba(0, 0, 0, 0.80)" },
            900: { value: "rgba(0, 0, 0, 0.92)" },
            950: { value: "rgba(0, 0, 0, 0.95)" },
          },
        },
        fonts: {
          heading: { value: "var(--font-body), sans-serif" },
          body: { value: "var(--font-body), sans-serif" },
          mono: {
            value:
              "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
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
              value: { _light: "{colors.white}", _dark: "{colors.gray.900}" },
            },
            bold: {
              value: {
                _light: "{colors.gray.100}",
                _dark: "{colors.gray.800}",
              },
            },
            muted: {
              value: {
                _light: "{colors.gray.100}",
                _dark: "{colors.gray.800}",
              },
            },
            popover: {
              value: { _light: "{colors.white}", _dark: "{colors.gray.800}" },
            },
            primary: {
              subtle: {
                value: {
                  _light: "{colors.green.500}",
                  _dark: "{colors.green.400}",
                },
              },
              bold: {
                value: {
                  _light: "{colors.green.600}",
                  _dark: "{colors.green.500}",
                },
              },
            },
            secondary: {
              subtle: { value: "{colors.black}" },
              bold: {
                value: {
                  _light: "{colors.gray.700}",
                  _dark: "{colors.gray.800}",
                },
              },
            },
            tertiary: {
              bold: {
                value: {
                  _light: "{colors.green.100}",
                  _dark: "{colors.green.950}",
                },
              },
              subtle: {
                value: {
                  _light: "{colors.green.50}",
                  _dark: "{colors.green.950}",
                },
              },
            },
            code: {
              block: {
                value: {
                  _light: "{colors.gray.50}",
                  _dark: "{colors.gray.800/20}",
                },
              },
              inline: {
                value: {
                  _light: "{colors.blackAlpha.100}",
                  _dark: "{colors.whiteAlpha.100}",
                },
              },
            },
          },
          text: {
            DEFAULT: {
              value: { _light: "{colors.gray.900}", _dark: "{colors.gray.50}" },
            },
            bold: {
              value: { _light: "{colors.gray.950}", _dark: "{colors.white}" },
            },
            subtle: {
              value: {
                _light: "{colors.gray.600}",
                _dark: "{colors.gray.400}",
              },
            },
            muted: {
              value: {
                _light: "{colors.gray.500}",
                _dark: "{colors.gray.500}",
              },
            },
            inverse: {
              value: { _light: "{colors.white}", _dark: "{colors.gray.950}" },
            },
            primary: {
              bold: {
                value: {
                  _light: "{colors.green.600}",
                  _dark: "{colors.green.400}",
                },
              },
              subtle: {
                value: {
                  _light: "{colors.green.700}",
                  _dark: "{colors.green.300}",
                },
              },
            },
          },
          border: {
            DEFAULT: {
              value: {
                _light: "{colors.gray.200}",
                _dark: "{colors.whiteAlpha.100}",
              },
            },
            subtle: {
              value: {
                _light: "{colors.gray.100}",
                _dark: "{colors.whiteAlpha.50}",
              },
            },
            bold: {
              value: {
                _light: "{colors.gray.300}",
                _dark: "{colors.whiteAlpha.200}",
              },
            },
            primary: {
              subtle: {
                value: {
                  _light: "{colors.green.500}",
                  _dark: "{colors.green.400}",
                },
              },
              bold: {
                value: {
                  _light: "{colors.green.600}",
                  _dark: "{colors.green.500}",
                },
              },
            },
          },
          shadow: {
            DEFAULT: {
              value: {
                _light: "{colors.blackAlpha.400}",
                _dark: "{colors.blackAlpha.700}",
              },
            },
          },
        },
      },

      textStyles: {
        "display.2xl": {
          value: {
            fontSize: { base: "4xl", md: "5xl" },
            fontWeight: "bold",
            lineHeight: "1.25",
            letterSpacing: "-0.025em",
          },
        },
        "display.xl": {
          value: {
            fontSize: { base: "3xl", md: "4xl" },
            fontWeight: "bold",
            lineHeight: "1.25",
            letterSpacing: "-0.025em",
          },
        },
        "display.lg": {
          value: {
            fontSize: { base: "2xl", md: "3xl" },
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
      borderColor: "border",
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
        listStyleType: "revert",
      },
      "& :is(h2, h3, h4)": {
        scrollMarginTop: "24",
        "&:hover": {
          "& a.anchor": { opacity: 1 },
        },
        "& a:focus": { opacity: 1 },
      },
      "& :is(p, li:not([role]))": {
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
