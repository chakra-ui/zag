import { defineConfig } from "@pandacss/dev"
import { grays, semanticColors } from "./theme/colors"
import { recipes, slotRecipes } from "./theme/recipes"

export default defineConfig({
  preflight: true,
  presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],
  include: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./demos/**/*.{js,jsx,ts,tsx}",
  ],
  exclude: [],
  jsxFramework: "react",

  theme: {
    extend: {
      recipes,
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        fadeUp: {
          from: { opacity: "0", translate: "0 8px" },
          to: { opacity: "1", translate: "0 0" },
        },
      },
      slotRecipes,
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
            ...grays,
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
              "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
          },
        },
      },
      semanticTokens: {
        colors: {
          bg: {
            ...semanticColors.bg,
            DEFAULT: semanticColors.bg.page,
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
              // pair with text.inverse: white in light, near-black in dark
              subtle: {
                value: {
                  _light: "{colors.green.600}",
                  _dark: "{colors.green.400}",
                },
              },
              bold: {
                value: {
                  _light: "{colors.green.700}",
                  _dark: "{colors.green.300}",
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
                  _dark: "{colors.gray.800}",
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
            // both clear WCAG AA (4.5:1) on bg and bg.muted in each theme
            subtle: {
              value: {
                _light: "{colors.gray.700}",
                _dark: "{colors.gray.300}",
              },
            },
            muted: {
              value: {
                _light: "{colors.gray.600}",
                _dark: "{colors.gray.400}",
              },
            },
            inverse: {
              value: { _light: "{colors.white}", _dark: "{colors.gray.950}" },
            },
            error: {
              value: { _light: "#c53030", _dark: "#fc8181" },
            },
            primary: {
              bold: {
                value: {
                  _light: "{colors.green.700}",
                  _dark: "{colors.green.400}",
                },
              },
              subtle: {
                value: {
                  _light: "{colors.green.800}",
                  _dark: "{colors.green.300}",
                },
              },
            },
          },
          fg: semanticColors.fg,
          accent: semanticColors.accent,
          syntax: semanticColors.syntax,
          border: {
            ...semanticColors.border,
            error: {
              value: { _light: "#c53030", _dark: "#fc8181" },
            },
            bold: semanticColors.border.strong,
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
        display: {
          value: {
            fontFamily: "body",
            fontSize: "48px",
            lineHeight: "1.06",
            letterSpacing: "-0.04em",
            fontWeight: "600",
          },
        },
        hero: {
          value: {
            fontFamily: "body",
            fontSize: "44px",
            lineHeight: "1.08",
            letterSpacing: "-0.035em",
            fontWeight: "600",
          },
        },
        sectionFeatured: {
          value: {
            fontFamily: "body",
            fontSize: "38px",
            lineHeight: "1.15",
            letterSpacing: "-0.035em",
            fontWeight: "600",
          },
        },
        section: {
          value: {
            fontFamily: "body",
            fontSize: "30px",
            lineHeight: "1.2",
            letterSpacing: "-0.03em",
            fontWeight: "600",
          },
        },
        docTitle: {
          value: {
            fontFamily: "body",
            fontSize: "40px",
            lineHeight: "1.1",
            letterSpacing: "-0.035em",
            fontWeight: "600",
          },
        },
        h2Doc: {
          value: {
            fontFamily: "body",
            fontSize: "24px",
            lineHeight: "1.3",
            letterSpacing: "-0.02em",
            fontWeight: "600",
          },
        },
        h3Doc: {
          value: {
            fontFamily: "body",
            fontSize: "17px",
            lineHeight: "1.4",
            letterSpacing: "0",
            fontWeight: "600",
          },
        },
        lead: {
          value: {
            fontFamily: "body",
            fontSize: "17px",
            lineHeight: "1.7",
            letterSpacing: "0",
            fontWeight: "400",
          },
        },
        body: {
          value: {
            fontFamily: "body",
            fontSize: "15px",
            lineHeight: "1.65",
            letterSpacing: "0",
            fontWeight: "400",
          },
        },
        small: {
          value: {
            fontFamily: "body",
            fontSize: "13px",
            lineHeight: "1.55",
            letterSpacing: "0",
            fontWeight: "400",
          },
        },
        eyebrow: {
          value: {
            fontFamily: "mono",
            fontSize: "11px",
            lineHeight: "1.4",
            letterSpacing: "0.08em",
            fontWeight: "400",
            textTransform: "uppercase",
          },
        },
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
    // smooth in-page #hash jumps; Next pauses it during route changes (data-scroll-behavior on <html>)
    html: {
      "@media (prefers-reduced-motion: no-preference)": {
        scrollBehavior: "smooth",
      },
    },

    body: {
      fontFamily: "body",
      textRendering: "geometricprecision",
      textSizeAdjust: "100%",
      WebkitFontSmoothing: "antialiased",
      bg: "bg.page",
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
        color: "text.primary.bold",
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
        // clears the sticky top nav and docs tab bar
        scrollMarginTop: "32",
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
