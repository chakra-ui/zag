// one column for the header, pages and footer: 1160px of content plus the gutter
export const gutter = { base: "4", sm: "6", md: "8" } as const

export const container = { maxW: "1224px", mx: "auto", px: gutter } as const

// docs need room for the sidebar and table of contents
export const wideContainer = { ...container, maxW: "1440px" } as const
