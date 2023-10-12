import { parseColor, type Color } from "@zag-js/color-utils"
import { ref } from "@zag-js/core"

export const parse = (color: string): Color => ref(parseColor(color)) as unknown as Color
