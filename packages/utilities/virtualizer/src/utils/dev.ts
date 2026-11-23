import { warn } from "@zag-js/utils/guard"

export type SetupWarning = "scaled-container" | "unconstrained-container" | "unmeasured-items" | "duplicate-key"

const messages: Record<SetupWarning, string> = {
  "scaled-container":
    "Scaled (`transform: scale(...)`) scroll containers are not supported. Measurements and scroll offsets can drift.",
  "unconstrained-container":
    "The scroll container grows to fit every item, so nothing is virtualized. Give it a fixed `height` or `max-height` (`width` for horizontal lists).",
  "unmeasured-items":
    "No item has been measured, so positions rely on `estimatedItemSize` alone. Spread `getItemProps(item)` on each item, or use `itemSize` if every item is the same size.",
  "duplicate-key":
    "`indexToKey` returned the same key for two items. Keys must be unique, or measurements are applied to the wrong items.",
}

export class SetupWarnings {
  private warned = new Set<SetupWarning>()

  warn(warning: SetupWarning): void {
    if (this.warned.has(warning)) return
    this.warned.add(warning)
    warn(`[@zag-js/virtualizer] ${messages[warning]}`)
  }
}
