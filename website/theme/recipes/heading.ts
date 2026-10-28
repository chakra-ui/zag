import { defineSlotRecipe } from "@pandacss/dev"

export const twoToneHeading = defineSlotRecipe({
  className: "two-tone-heading",
  description: "Section title: first line in fg, second line in accent",
  slots: ["root", "eyebrow", "title", "accent", "lead"],
  base: {
    root: { display: "flex", flexDirection: "column", minW: "0" },
    eyebrow: {
      fontFamily: "mono",
      fontSize: "12px",
      color: "fg.subtle",
      mb: "4",
    },
    title: { color: "fg", textWrap: "balance" },
    accent: { display: "block", color: "accent" },
    lead: {
      mt: "5",
      fontSize: "16px",
      lineHeight: "1.75",
      color: "fg.muted",
      textWrap: "pretty",
    },
  },
  variants: {
    size: {
      hero: { title: { textStyle: "hero" } },
      sectionFeatured: { title: { textStyle: "sectionFeatured" } },
      section: { title: { textStyle: "section" } },
      display: { title: { textStyle: "display" }, lead: { fontSize: "17px" } },
    },
  },
  defaultVariants: { size: "section" },
})
