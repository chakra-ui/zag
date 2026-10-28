const mode = (light: string, dark: string) => ({
  value: { _light: light, _dark: dark },
})

export const grays = {
  "925": { value: "#0b0b0c" },
}

export const semanticColors = {
  bg: {
    page: mode("{colors.white}", "{colors.gray.925}"),
    raised: mode("{colors.gray.50}", "#121214"),
    inset: mode("{colors.gray.50}", "#0f0f11"),
    control: mode("{colors.gray.100}", "#1a1a1d"),
    deep: mode("{colors.gray.950}", "#0b0b0c"),
  },
  border: {
    DEFAULT: mode("{colors.gray.200}", "#202024"),
    subtle: mode("{colors.gray.100}", "#17171a"),
    strong: mode("{colors.gray.300}", "#303036"),
  },
  fg: {
    DEFAULT: mode("{colors.gray.950}", "{colors.gray.50}"),
    muted: mode("{colors.gray.600}", "{colors.gray.400}"),
    subtle: mode("{colors.gray.500}", "{colors.gray.500}"),
    faint: mode("{colors.gray.400}", "{colors.gray.600}"),
  },
  accent: {
    DEFAULT: mode("{colors.green.600}", "{colors.green.300}"),
    tint: mode("{colors.green.50}", "#0e1a12"),
    line: mode("{colors.green.100}", "{colors.green.800}"),
    solid: mode("{colors.green.50}", "{colors.green.900}"),
    solidFg: mode("{colors.green.800}", "{colors.green.100}"),
  },
  syntax: {
    plain: mode("#18181b", "#e4e4e7"),
    keyword: mode("#BE185D", "#F9A8D4"),
    function: mode("#1D4ED8", "#93C5FD"),
    string: mode("#15803D", "#86EFAC"),
    property: mode("#7C3AED", "#C4B5FD"),
    attr: mode("#B45309", "#FDE68A"),
    tag: mode("#BE123C", "#FDA4AF"),
    comment: mode("#a1a1aa", "#71717a"),
  },
}
