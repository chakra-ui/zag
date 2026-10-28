import { defineRecipe, defineSlotRecipe } from "@pandacss/dev"

export const featurePanel = defineSlotRecipe({
  className: "feature-panel",
  description:
    "Featured chapter body: a drawing and a side table joined by hairlines",
  slots: ["root", "art", "side", "cell", "cellTitle", "cellBody"],
  base: {
    root: {
      display: "grid",
      gridTemplateColumns: { base: "1fr", lg: "minmax(0, 1fr) 400px" },
      gap: "1px",
      bg: "accent.line",
      borderWidth: "1px",
      borderColor: "accent.line",
      rounded: "2xl",
      overflow: "hidden",
    },
    art: {
      display: "grid",
      placeItems: "center",
      py: "8",
      px: "6",
      bg: "bg.page",
      "& > *": { w: "full", maxW: "640px" },
    },
    side: {
      display: "flex",
      flexDirection: "column",
      gap: "1px",
      bg: "accent.line",
    },
    cell: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "2",
      flex: "1",
      px: "6",
      py: "5",
      bg: "accent.tint",
    },
    cellTitle: {
      display: "flex",
      alignItems: "center",
      gap: "1.5",
      fontSize: "15px",
      fontWeight: "medium",
      color: "fg",
    },
    cellBody: { fontSize: "14px", lineHeight: "1.6", color: "fg.muted" },
  },
})

export const termList = defineSlotRecipe({
  className: "term-list",
  description: "Two-column term and body rows under a chapter lead",
  slots: ["root", "item", "term", "body"],
  base: {
    root: { mt: "6", borderTopWidth: "1px", borderColor: "border" },
    item: {
      display: "flex",
      gap: "4",
      py: "3",
      borderBottomWidth: "1px",
      borderColor: "border",
    },
    term: {
      w: "140px",
      flexShrink: "0",
      fontSize: "14px",
      fontWeight: "medium",
      color: "fg",
    },
    body: { fontSize: "14px", lineHeight: "1.6", color: "fg.muted" },
  },
})

export const stateStepper = defineSlotRecipe({
  className: "state-stepper",
  description: "A row of machine states with the events between them",
  slots: ["root", "step", "event"],
  base: {
    root: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: "2.5",
      px: "4",
      py: "4.5",
      bg: "bg.raised",
      borderTopWidth: "1px",
      borderColor: "border",
    },
    step: {
      fontFamily: "mono",
      fontSize: "12px",
      color: "fg.muted",
      px: "2.5",
      py: "1",
      rounded: "full",
      borderWidth: "1px",
      borderColor: "border.strong",
      bg: "bg.page",
      transitionProperty: "background, color, box-shadow",
      transitionDuration: "normal",
      "&[data-active]": {
        bg: "accent",
        borderColor: "accent",
        color: { base: "white", _dark: "gray.950" },
        boxShadow: "0 0 0 4px {colors.accent.line}",
      },
    },
    event: {
      fontFamily: "mono",
      fontSize: "10px",
      letterSpacing: "0.04em",
      color: "fg.faint",
    },
  },
})

export const keycap = defineRecipe({
  className: "keycap",
  description: "A key or state label inside the events table",
  base: {
    display: "inline-flex",
    alignItems: "center",
    px: "1.5",
    py: "0.5",
    rounded: "sm",
    fontFamily: "mono",
    fontSize: "12px",
    lineHeight: "1.4",
  },
  variants: {
    kind: {
      key: { borderWidth: "1px", borderColor: "border.strong", color: "fg" },
      state: { bg: "bg.control", color: "fg.muted" },
      active: { bg: "accent.solid", color: "accent.solidFg" },
    },
  },
  defaultVariants: { kind: "key" },
})
