import { defineSlotRecipe } from "@pandacss/dev"

export const example = defineSlotRecipe({
  className: "example",
  description: "Usage example: Preview and Code tabs over a bordered box",
  slots: ["root", "bar", "list", "tab", "stage", "code"],
  base: {
    root: { my: "6" },
    bar: { display: "flex", alignItems: "center", gap: "1", mb: "3" },
    list: { display: "flex", alignItems: "center", gap: "1" },
    tab: {
      px: "3.5",
      py: "1.5",
      rounded: "md",
      fontSize: "15px",
      fontWeight: "medium",
      color: "fg.subtle",
      cursor: "pointer",
      transitionProperty: "color, background",
      transitionDuration: "fast",
      _hover: { color: "fg" },
      _selected: { color: "fg", bg: "bg.raised" },
      _focusVisible: {
        outline: "2px solid",
        outlineColor: "accent",
        outlineOffset: "1px",
      },
    },
    stage: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      p: { base: "6", md: "10" },
      borderWidth: "1px",
      borderColor: "border",
      rounded: "lg",
      "& > *": { w: "full", alignItems: "flex-start" },
    },
    code: {
      borderWidth: "1px",
      borderColor: "border",
      rounded: "lg",
      overflow: "hidden",
      "& pre": {
        my: "0 !important",
        borderWidth: "0 !important",
        rounded: "0 !important",
      },
      "& [role=tabpanel]": { mt: "0 !important" },
      "& > div, & > figure": {
        maxW: "none !important",
        my: "0 !important",
        borderWidth: "0 !important",
        rounded: "0 !important",
      },
    },
  },
})
