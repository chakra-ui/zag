import type { Required } from "@zag-js/types"
import type { IntlTranslations } from "./floating-panel.types"

export const defaultTranslations: Required<IntlTranslations> = {
  minimize: "Minimize window",
  maximize: "Maximize window",
  restore: "Restore window",
  resizeTrigger: "Resize window",
  moved: ({ position }) => `Window moved to ${Math.round(position.x)}, ${Math.round(position.y)}`,
  resized: ({ size }) => `Window resized to ${Math.round(size.width)} by ${Math.round(size.height)}`,
}
