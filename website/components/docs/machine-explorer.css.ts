import { css } from "styled-system/css"

// one vivid hue per state; edges and labels take their source state's hue
const lightHues = {
  "--machine-hue-0": "#7c3aed",
  "--machine-hue-1": "#2563eb",
  "--machine-hue-2": "#059669",
  "--machine-hue-3": "#ea580c",
  "--machine-hue-4": "#db2777",
  "--machine-hue-5": "#0891b2",
  "--machine-hue-6": "#ca8a04",
  "--machine-hue-7": "#dc2626",
}

const darkHues = {
  "--machine-hue-0": "#a78bfa",
  "--machine-hue-1": "#60a5fa",
  "--machine-hue-2": "#34d399",
  "--machine-hue-3": "#fb923c",
  "--machine-hue-4": "#f472b6",
  "--machine-hue-5": "#22d3ee",
  "--machine-hue-6": "#facc15",
  "--machine-hue-7": "#f87171",
}

export const root = css({
  ...lightHues,
  _dark: darkHues,
  position: "relative",
  display: "flex",
  flexDirection: "column",
  h: "full",
  bgImage: "radial-gradient({colors.line} 1px, transparent 1px)",
  bgSize: "22px 22px",
})

export const viewport = css({ flex: "1", minH: "0", overflow: "auto", p: "4" })

// margin auto centers small machines without clipping large ones
export const svg = css({
  display: "block",
  maxW: "none",
  m: "auto",
  overflow: "visible",
})

export const fade = css({
  outline: "none",
  "&[role=button]": { cursor: "pointer" },
  "&:focus-visible rect": { stroke: "{colors.ink}", strokeWidth: "2" },
  transition: "opacity 150ms",
  "&[data-dim]": { opacity: "0.2" },
})

export const fadeEdge = css({
  transition: "opacity 150ms",
  "&[data-dim]": { opacity: "0.1" },
})

// solid pills: the state's hue fills the node
export const node = css({
  fill: "var(--hue)",
  filter:
    "drop-shadow(0 4px 8px color-mix(in srgb, var(--hue) 35%, transparent))",
  "[aria-pressed=true] > &": { stroke: "{colors.ink}", strokeWidth: "2.5" },
})

export const nodeText = css({
  // white on the deeper light-theme hues, near-black on the brighter dark-theme ones
  fill: { base: "white", _dark: "#0f1211" },
  fontFamily: "mono",
  fontSize: "13.5px",
  fontWeight: "600",
  textAnchor: "middle",
  dominantBaseline: "central",
  pointerEvents: "none",
})

export const group = css({
  fill: "color-mix(in srgb, var(--hue) 6%, transparent)",
  stroke: "var(--hue)",
  strokeWidth: "1.5",
  strokeDasharray: "6 5",
})

export const groupLabel = css({
  fill: "var(--hue)",
  fontFamily: "mono",
  fontSize: "12.5px",
  fontWeight: "700",
})

export const edgePath = css({
  fill: "none",
  stroke: "var(--hue)",
  strokeWidth: "1.75",
})

export const arrow = css({ fill: "var(--hue)" })

export const labelBox = css({
  fill: "{colors.canvas}",
  stroke: "color-mix(in srgb, var(--hue) 50%, transparent)",
  strokeWidth: "1",
})

export const labelText = css({
  fill: "var(--hue)",
  fontFamily: "mono",
  fontSize: "11px",
})

export const start = css({
  fill: "{colors.ink}",
  stroke: "{colors.ink}",
  strokeWidth: "1.75",
})

export const legend = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "1.5",
  px: "4",
  py: "2.5",
  borderBottomWidth: "1px",
  borderColor: "line",
  bg: "surface",
})

export const legendTitle = css({
  fontSize: "12px",
  fontWeight: "medium",
  color: "ink.muted",
  me: "1",
})

export const legendItem = css({
  px: "1.5",
  rounded: "sm",
  bg: "ink/5",
  fontFamily: "mono",
  fontSize: "11px",
  color: "ink",
})

export const zoom = css({
  position: "absolute",
  right: "4",
  bottom: "4",
  display: "flex",
  rounded: "lg",
  bg: "surface",
  boxShadow: "0 0 0 1px {colors.line}, 0 4px 12px -6px rgb(0 0 0 / 0.2)",
  overflow: "hidden",
})

export const zoomButton = css({
  display: "grid",
  placeItems: "center",
  boxSize: "8",
  color: "ink.muted",
  cursor: "pointer",
  _hover: { bg: "ink/5", color: "ink" },
  _focusVisible: {
    outline: "2px solid {colors.primary}",
    outlineOffset: "-2px",
  },
  "& svg": { boxSize: "3.5" },
})
