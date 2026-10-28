import { defineSlotRecipe } from "@pandacss/dev"

export const pageHeader = defineSlotRecipe({
  className: "page-header",
  description:
    "Header for showcase, community and blog: eyebrow, two-tone title, lead, action",
  slots: ["root", "copy", "eyebrow", "lead"],
  base: {
    root: {
      display: "flex",
      flexDirection: { base: "column", md: "row" },
      alignItems: { base: "flex-start", md: "flex-end" },
      justifyContent: "space-between",
      gap: "6",
      pt: { base: "14", md: "20" },
      pb: "10",
    },
    copy: {
      display: "flex",
      flexDirection: "column",
      gap: "3.5",
      maxW: "860px",
    },
    eyebrow: {
      fontFamily: "mono",
      fontSize: "12px",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "fg.subtle",
    },
    lead: { textStyle: "lead", color: "fg.muted", textWrap: "pretty" },
  },
})

export const showcaseCard = defineSlotRecipe({
  className: "showcase-card",
  jsx: ["ShowcaseCard"],
  description: "Project card: screenshot over name and description",
  slots: ["root", "media", "body", "text", "name", "description", "tag"],
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      bg: "bg.raised",
      borderWidth: "1px",
      borderColor: "border",
      rounded: "14px",
      overflow: "hidden",
      transitionProperty: "border-color, translate, box-shadow",
      transitionDuration: "normal",
      transitionTimingFunction: "ease-out",
      _hover: {
        borderColor: "border.strong",
        translate: "0 -2px",
        "& [data-part=media] img": { scale: "1.02" },
      },
      _focusVisible: {
        outline: "2px solid",
        outlineColor: "accent",
        outlineOffset: "2px",
      },
      _motionReduce: {
        _hover: { translate: "0", "& [data-part=media] img": { scale: "1" } },
      },
    },
    media: {
      position: "relative",
      flex: "1",
      minH: "0",
      overflow: "hidden",
      bg: "bg.inset",
      borderBottomWidth: "1px",
      borderColor: "border",
      "& img": { transition: "scale 400ms cubic-bezier(0.2, 0, 0, 1)" },
    },
    body: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "3",
      px: "18px",
      pt: "3.5",
      pb: "4",
    },
    text: { display: "flex", flexDirection: "column", gap: "1", minW: "0" },
    name: { fontSize: "16px", fontWeight: "semibold", color: "fg" },
    description: { fontSize: "13px", color: "fg.muted", lineClamp: "2" },
    tag: { flexShrink: "0" },
  },
  variants: {
    size: {
      lg: {
        media: { aspectRatio: "790/440", flex: "none" },
        body: { px: "22px", pt: "18px", pb: "5" },
        name: { fontSize: "18px" },
        description: { fontSize: "14px" },
      },
      md: {
        media: {
          aspectRatio: { base: "384/220", lg: "390/172" },
          flex: "none",
        },
      },
      sm: { media: { aspectRatio: "384/220", flex: "none" } },
    },
  },
  defaultVariants: { size: "sm" },
})
