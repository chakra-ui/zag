import { defineRecipe, defineSlotRecipe } from "@pandacss/dev"

export const docsShell = defineSlotRecipe({
  className: "docs-shell",
  description: "Docs columns: sidebar, article and table of contents",
  slots: [
    "root",
    "sidebar",
    "scroll",
    "main",
    "toc",
    "header",
    "crumb",
    "title",
  ],
  base: {
    root: {
      display: "grid",
      gridTemplateColumns: {
        base: "minmax(0, 1fr)",
        lg: "250px minmax(0, 1fr)",
        xl: "250px minmax(0, 800px) minmax(220px, 1fr)",
      },
      maxW: "1440px",
    },
    sidebar: {
      hideBelow: "lg",
      position: "sticky",
      top: "calc(6.5rem + 2px)",
      h: "calc(100dvh - 6.5rem - 2px)",
      borderEndWidth: "1px",
      borderColor: "border.subtle",
    },
    scroll: {
      h: "full",
      overflowY: "auto",
      overscrollBehavior: "contain",
      scrollbarWidth: "thin",
      scrollbarColor: "token(colors.border.strong) transparent",
    },
    main: {
      minW: "0",
      px: { base: "4", sm: "6", md: "12" },
      pt: "9",
      pb: "24",
      "& > p:first-of-type": {
        textStyle: "lead",
        color: "fg.muted",
        mt: "0",
      },
    },
    toc: {
      hideBelow: "xl",
      position: "sticky",
      top: "calc(6.5rem + 2px)",
      h: "calc(100dvh - 6.5rem - 2px)",
      borderStartWidth: "1px",
      borderColor: "border.subtle",
    },
    header: { display: "flex", flexDirection: "column", gap: "4", mb: "4" },
    crumb: { fontFamily: "mono", fontSize: "12px", color: "fg.subtle" },
    title: { textStyle: "docTitle", color: "fg", flex: "1" },
  },
})

export const docsNav = defineSlotRecipe({
  className: "docs-nav",
  description: "Sidebar groups and the on-this-page list",
  slots: ["root", "group", "heading", "list", "link", "dot", "badge"],
  base: {
    root: { display: "flex", flexDirection: "column", gap: "5.5" },
    group: { display: "flex", flexDirection: "column", gap: "0.5" },
    heading: {
      mb: "1",
      fontFamily: "mono",
      fontSize: "11px",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "fg.subtle",
    },
    list: { display: "flex", flexDirection: "column", gap: "0.5" },
    link: {
      display: "flex",
      alignItems: "center",
      gap: "2",
      px: "2.5",
      rounded: "lg",
      color: "fg.muted",
      transitionProperty: "color, background",
      transitionDuration: "fast",
      transitionTimingFunction: "ease-out",
      _hover: { color: "fg" },
      _focusVisible: {
        outline: "2px solid",
        outlineColor: "accent",
        outlineOffset: "-2px",
      },
      "&[aria-current]": { color: "fg" },
    },
    dot: {
      ms: "auto",
      boxSize: "1.5",
      rounded: "full",
      bg: "accent",
      flexShrink: "0",
    },
    badge: {
      px: "1.5",
      rounded: "sm",
      borderWidth: "1px",
      borderColor: "border.strong",
      fontFamily: "mono",
      fontSize: "10px",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "fg.subtle",
    },
  },
  variants: {
    variant: {
      sidebar: {
        root: { pt: "7", pb: "10", ps: { base: "0", lg: "8" }, pe: "5" },
        link: {
          py: "1.5",
          fontSize: "14px",
          "&[aria-current]": { bg: "bg.raised", fontWeight: "medium" },
          _hover: { bg: "bg.raised" },
        },
      },
      toc: {
        root: { gap: "1", pt: "9", pb: "10", ps: "7", pe: "5", maxW: "300px" },
        heading: { mb: "2" },
        list: {
          gap: "0",
          borderStartWidth: "1px",
          borderColor: "border.subtle",
        },
        link: {
          py: "1",
          ps: "3",
          ms: "-1px",
          rounded: "0",
          fontSize: "13px",
          lineHeight: "1.45",
          borderStartWidth: "1px",
          borderColor: "transparent",
          "&[data-depth=nested]": {
            ps: "6",
            fontSize: "12px",
            color: "fg.subtle",
          },
          "&[aria-current]": { borderColor: "accent", color: "fg" },
        },
      },
    },
  },
  defaultVariants: { variant: "sidebar" },
})

export const resourceChip = defineRecipe({
  className: "resource-chip",
  description: "Package, logic, source and WAI-ARIA links under a doc title",
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "1.5",
    px: "2.5",
    py: "1",
    rounded: "md",
    fontFamily: "mono",
    fontSize: "12px",
    transitionProperty: "color, background",
    transitionDuration: "fast",
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "accent",
      outlineOffset: "2px",
    },
    "& svg": { fontSize: "13px" },
  },
  variants: {
    tone: {
      neutral: {
        bg: "bg.raised",
        color: "fg.muted",
        _hover: { color: "fg", bg: "bg.control" },
      },
      accent: {
        bg: "accent.tint",
        color: "accent",
        _hover: { bg: "accent.line" },
      },
    },
  },
  defaultVariants: { tone: "neutral" },
})
