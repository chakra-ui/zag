import { ensure } from "@zag-js/utils"
import type { NormalizedPanelData } from "../splitter.types"
import { fuzzyCompareNumbers, PRECISION } from "./fuzzy"

interface ResizePanelOptions {
  panels: NormalizedPanelData[]
  index: number
  size: number
  prevSize?: number | undefined
}

export function getCollapsedThreshold(panel: NormalizedPanelData) {
  const { collapsedSize = 0, collapsedThreshold, minSize = 0 } = panel
  return collapsedThreshold ?? (minSize - collapsedSize) / 2
}

export function resizePanel({ panels, index, size, prevSize }: ResizePanelOptions) {
  const panel = panels[index]
  ensure(panel, () => `Panel data not found for index ${index}`)

  if (panel.disabled && prevSize != null) return prevSize

  const { collapsedSize = 0, collapsible, maxSize = 100, minSize = 0 } = panel

  if (fuzzyCompareNumbers(size, minSize) < 0) {
    if (collapsible) {
      const threshold = getCollapsedThreshold(panel)
      const wasCollapsed = prevSize != null && fuzzyCompareNumbers(prevSize, collapsedSize) <= 0
      const boundary = wasCollapsed ? collapsedSize + threshold : minSize - threshold
      size = fuzzyCompareNumbers(size, boundary) < 0 ? collapsedSize : minSize
    } else {
      size = minSize
    }
  }

  size = Math.min(maxSize, size)
  return parseFloat(size.toFixed(PRECISION))
}
