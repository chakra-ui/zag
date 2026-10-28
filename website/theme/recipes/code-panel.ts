import { defineSlotRecipe } from "@pandacss/dev"

export const codePanel = defineSlotRecipe({
  className: "code-panel",
  jsx: ["CodePanel"],
  description:
    "A file of code with highlighted lines, tinted by the styling tool",
  slots: ["root", "file", "pre", "line", "text", "note"],
  base: {
    root: { display: "flex", flexDirection: "column", minW: "0" },
    file: {
      px: "5",
      py: "3",
      fontFamily: "mono",
      fontSize: "12px",
      color: "fg",
      borderBottomWidth: "1px",
      borderColor: "border",
    },
    pre: {
      m: "0",
      py: "4",
      overflowX: "auto",
      bg: "transparent",
      fontFamily: "mono",
      fontSize: "13px",
      lineHeight: "1.9",
    },
    line: {
      display: "flex",
      alignItems: "center",
      gap: "4",
      px: "5",
      minH: "1.9em",
      transitionProperty: "background",
      transitionDuration: "normal",
      "&[data-active]": {
        bg: "color-mix(in srgb, var(--code-tone) 8%, transparent)",
        boxShadow: "inset 2px 0 0 var(--code-tone)",
      },
    },
    text: { flex: "1", whiteSpace: "pre" },
    note: { fontSize: "11px", color: "accent", whiteSpace: "nowrap" },
  },
  variants: {
    tone: {
      accent: { root: { "--code-tone": "colors.accent" } },
      panda: { root: { "--code-tone": "#F6E458" } },
      tailwind: { root: { "--code-tone": "#38BDF8" } },
    },
  },
  defaultVariants: { tone: "accent" },
})
