import { css } from "styled-system/css"

// each language in its own brand color, a little brighter in dark mode
export const icon = css({
  boxSize: "3.5",
  flexShrink: "0",
  color: "ink.muted",
  "&:is([data-ext=ts], [data-ext=mts], [data-ext=cts])": {
    color: { base: "#3178c6", _dark: "#5b9be6" },
  },
  "&:is([data-ext=tsx], [data-ext=jsx])": {
    color: { base: "#087ea4", _dark: "#58c4dc" },
  },
  "&:is([data-ext=js], [data-ext=mjs], [data-ext=cjs])": {
    color: { base: "#c9a000", _dark: "#f7df1e" },
  },
  "&[data-ext=css]": { color: { base: "#663399", _dark: "#a77bdc" } },
  "&[data-ext=html]": { color: { base: "#e34f26", _dark: "#f16529" } },
  "&[data-ext=vue]": { color: { base: "#2f9c6f", _dark: "#41b883" } },
  "&[data-ext=svelte]": { color: { base: "#e53d00", _dark: "#ff3e00" } },
  "&:is([data-ext=yml], [data-ext=yaml])": {
    color: { base: "#cb171e", _dark: "#f05a5f" },
  },
})
