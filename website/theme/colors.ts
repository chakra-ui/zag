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
  // docs tokens follow the site palette (siteColors)
  bg: {
    page: { value: "{colors.canvas}" },
    raised: mode("#eef1ef", "#171b1a"),
    inset: mode("#f0f2f0", "#0c0f0e"),
    control: mode("#e8ece9", "#1c2120"),
    deep: mode("{colors.gray.950}", "#0c0f0e"),
  },
  border: {
    DEFAULT: { value: "{colors.line}" },
    subtle: { value: "{colors.line.edge}" },
    strong: { value: "{colors.line.strong}" },
  },
  fg: {
    DEFAULT: { value: "{colors.ink}" },
    muted: { value: "{colors.ink.muted}" },
    subtle: mode("#7b847e", "#7b847e"),
    faint: mode("#a3aba5", "#4f5853"),
    code: { value: "{colors.ink}" },
  },
  accent: {
    DEFAULT: { value: "{colors.primary}" },
    tint: mode("{colors.green.50}", "{colors.green.975}"),
    line: mode("{colors.green.100}", "{colors.green.800}"),
    solid: mode("{colors.green.50}", "{colors.green.900}"),
    solidFg: mode("{colors.green.800}", "{colors.green.100}"),
  },
  // same hues as the homepage code panels
  syntax: {
    plain: mode("{colors.ink}", "{colors.ink}"),
    keyword: mode("#7a3fd1", "#c9a8ff"),
    function: mode("#1b5fc1", "#8cc8ff"),
    string: mode("#137a4a", "#8ee3b5"),
    property: mode("#0f6a8f", "#9fd7ff"),
    attr: mode("#9a5b00", "#f2c97d"),
    tag: mode("#b4372b", "#ff9f94"),
    comment: mode("#8a938d", "#6b7a72"),
  },
}

// Site palette from the homepage redesign; inner pages move to these next
export const siteColors = {
  canvas: mode("#f7f8f7", "#0f1211"),
  surface: mode("#ffffff", "#151918"),
  ink: {
    DEFAULT: mode("#1a1d1b", "#e6eae7"),
    muted: mode("#69716c", "#8e9792"),
  },
  line: {
    DEFAULT: mode("#e3e7e4", "#232927"),
    edge: mode("#e9edea", "#1c2120"),
    strong: mode("#b7c0ba", "#46504b"),
  },
  primary: {
    DEFAULT: mode("#00a852", "#34d27d"),
    soft: mode("#e3f5ea", "#15301f"),
    solid: { value: "#00c65e" },
    solidHover: { value: "#12d46c" },
    solidInk: { value: "#032b15" },
  },
}
