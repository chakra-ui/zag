import { defineRecipe } from "@pandacss/dev"

export const steps = defineRecipe({
  className: "steps",
  description: "Numbered guide steps: each h2 inside gets a marker on one rule",
  base: {
    counterReset: "step",
    position: "relative",
    mt: "10",
    ms: "3.5",
    ps: "9",
    borderInlineStartWidth: "1px",
    borderColor: "border",
    "& > h2": {
      position: "relative",
      counterIncrement: "step",
      scrollMarginTop: "28",
    },
    "& > h2:first-child": { mt: "0 !important" },
    "& > h2::before": {
      content: "counter(step)",
      position: "absolute",
      insetInlineStart: "calc(-2.25rem - 14.5px)",
      top: "0.1em",
      display: "grid",
      placeItems: "center",
      boxSize: "7",
      rounded: "full",
      bg: "accent",
      color: "bg.page",
      fontFamily: "mono",
      fontSize: "12px",
      fontWeight: "medium",
      letterSpacing: "0",
    },
  },
})

export const guideMeta = defineRecipe({
  className: "guide-meta",
  description: "Time, stack and level chips under a guide's title",
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "2",
    mt: "4",
    mb: "8",
    "& > span": {
      px: "2.5",
      py: "1",
      rounded: "md",
      borderWidth: "1px",
      borderColor: "border",
      fontFamily: "mono",
      fontSize: "12px",
      color: "fg.muted",
    },
  },
})
