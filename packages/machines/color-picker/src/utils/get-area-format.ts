import type { ColorFormat } from "@zag-js/color-utils"

/** Color space used for the 2D area for the active output format. */
export function getAreaFormat(format: ColorFormat): ColorFormat {
  if (format.startsWith("hsl")) return "hsla"
  if (format.startsWith("hsb")) return "hsba"
  if (format.startsWith("rgb")) return "rgba"
  if (format === "oklab") return "hsba"
  if (format === "oklch") return "hsba"
  return "hsba"
}
