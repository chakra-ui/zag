const mode = (light: string, dark: string) => ({
  value: { _light: light, _dark: dark },
})

export const grays = {
  "450": { value: "#8a8a93" },
  "550": { value: "#66666e" },
  "750": { value: "#303036" },
  "850": { value: "#202024" },
  "870": { value: "#1a1a1d" },
  "880": { value: "#17171a" },
  "905": { value: "#121214" },
  "915": { value: "#0f0f11" },
  "925": { value: "#0b0b0c" },
}

export const greens = {
  "350": { value: "#4ade80" },
  "650": { value: "#287a51" },
  "975": { value: "#0e1a12" },
}

export const brands = {
  panda: { value: "#F6E458" },
  tailwind: { value: "#38BDF8" },
  stackblitz: { value: "#1389FD" },
  typescript: { value: "#3178C6" },
  discord: { value: "#5865F2" },
  youtube: { value: "#FF0000" },
}

export const semanticColors = {
  bg: {
    page: mode("{colors.white}", "{colors.gray.925}"),
    raised: mode("{colors.gray.50}", "{colors.gray.905}"),
    inset: mode("{colors.gray.50}", "{colors.gray.915}"),
    control: mode("{colors.gray.100}", "{colors.gray.870}"),
    deep: mode("{colors.gray.950}", "{colors.gray.925}"),
  },
  border: {
    DEFAULT: mode("{colors.gray.200}", "{colors.gray.850}"),
    subtle: mode("{colors.gray.100}", "{colors.gray.880}"),
    strong: mode("{colors.gray.300}", "{colors.gray.750}"),
  },
  fg: {
    DEFAULT: mode("{colors.gray.950}", "{colors.gray.50}"),
    muted: mode("{colors.gray.600}", "{colors.gray.400}"),
    subtle: mode("{colors.gray.550}", "{colors.gray.450}"),
    faint: mode("{colors.gray.400}", "{colors.gray.600}"),
  },
  accent: {
    DEFAULT: mode("{colors.green.650}", "{colors.green.350}"),
    tint: mode("{colors.green.50}", "{colors.green.975}"),
    line: mode("{colors.green.100}", "{colors.green.800}"),
    solid: mode("{colors.green.50}", "{colors.green.900}"),
    solidFg: mode("{colors.green.800}", "{colors.green.100}"),
  },
  syntax: {
    plain: mode("#18181b", "#e4e4e7"),
    keyword: mode("#BE185D", "#F9A8D4"),
    function: mode("#1D4ED8", "#93C5FD"),
    string: mode("#166534", "#86EFAC"),
    property: mode("#7C3AED", "#C4B5FD"),
    attr: mode("#B45309", "#FDE68A"),
    tag: mode("#BE123C", "#FDA4AF"),
    comment: mode("{colors.gray.550}", "{colors.gray.450}"),
  },
}
