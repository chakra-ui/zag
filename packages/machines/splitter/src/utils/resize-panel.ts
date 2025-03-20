/**
 * This code was modified from react-resizable-panels by Brian Vaughn
 * @see https://github.com/bvaughn/react-resizable-panels
 */

import { ensure } from "@zag-js/utils"
import type { PanelData } from "../splitter.types"
import { fuzzyCompareNumbers, PRECISION } from "./fuzzy"

export function resizePanel({ panels, index, size }: { panels: PanelData[]; index: number; size: number }) {
  const panel = panels[index]
  ensure(panel, `Panel data not found for index ${index}`)

  let { collapsedSize = 0, collapsible, maxSize = 100, minSize = 0 } = panel

  if (fuzzyCompareNumbers(size, minSize) < 0) {
    if (collapsible) {
      // Collapsible panels should snap closed or open only once they cross the halfway point between collapsed and min size.
      const halfwayPoint = (collapsedSize + minSize) / 2
      if (fuzzyCompareNumbers(size, halfwayPoint) < 0) {
        size = collapsedSize
      } else {
        size = minSize
      }
    } else {
      size = minSize
    }
  }

  size = Math.min(maxSize, size)
  size = parseFloat(size.toFixed(PRECISION))

  return size
}
