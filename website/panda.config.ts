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
            950: { value: "#0f172a" },
          },
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
            950: { value: "#064e3b" },
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

            primary: {
              subtle: {
                value: "{colors.green.500}",
              },
              bold: {
                value: {
                  _light: "{colors.green.600}",
                  _dark: "{colors.green.400}",
                },
              },
            },

            secondary: {
              subtle: { value: "{colors.black}" },
              bold: {
                value: {
                  _light: "{colors.gray.700}",
                  _dark: "{colors.gray.900}",
                },
              },
            },

            tertiary: {
              bold: {
                value: {
                  _light: "{colors.green.100}",
                  _dark: "{colors.green.900}",
                },
              },
              subtle: {
                value: {
                  _light: "{colors.green.50}",
                  _dark: "{colors.green.900}",
                },
              },
            },

            code: {
              block: {
                value: {
                  _light: "hsl(230, 1%, 98%)",
                  _dark: "{colors.gray.900}",
                },
              },
              inline: {
                value: {
                  _light: "{colors.blackAlpha.100}",
                  _dark: "{colors.whiteAlpha.100}",
                },
              },
            },

            header: {
              value: {
                _light: "{colors.whiteAlpha.900}",
                _dark: "rgba(26, 32, 44, 0.92)",
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
            inverse: {
              value: { _light: "{colors.white}", _dark: "{colors.gray.800}" },
            },
            primary: {
              bold: {
                value: {
                  _light: "{colors.green.500}",
                  _dark: "{colors.green.400}",
                },
              },
              subtle: {
                value: {
                  _light: "{colors.green.600}",
                  _dark: "{colors.green.400}",
                },
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
            primary: {
              subtle: {
                value: "{colors.green.500}",
              },
              bold: {
                value: {
                  _light: "{colors.green.600}",
                  _dark: "{colors.green.400}",
                },
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
