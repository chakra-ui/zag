/**
 * This code was modified from react-resizable-panels by Brian Vaughn
 * @see https://github.com/bvaughn/react-resizable-panels
 */

import { ensure } from "@zag-js/utils"
import type { NormalizedPanelData } from "../splitter.types"

export function calculateAriaValues({
  size,
  panels,
  pivotIndices,
}: {
  size: number[]
  panels: NormalizedPanelData[]
  pivotIndices: number[]
}) {
  let currentMinSize = 0
  let currentMaxSize = 100
  let totalMinSize = 0
  let totalMaxSize = 0

  const firstIndex = pivotIndices[0]
  ensure(firstIndex, () => "No pivot index found")

  panels.forEach((panel, index) => {
    const { maxSize = 100, minSize = 0 } = panel

    if (index === firstIndex) {
      currentMinSize = minSize
      currentMaxSize = maxSize
    } else {
      totalMinSize += minSize
      totalMaxSize += maxSize
    }
  })

  const valueMax = Math.min(currentMaxSize, 100 - totalMinSize)
  const valueMin = Math.max(currentMinSize, 100 - totalMaxSize)
  const valueNow = size[firstIndex]

  return {
    valueMax,
    valueMin,
    valueNow,
  }
}

export function getAriaValue(size: number[], panels: NormalizedPanelData[], handleId: string) {
  const [beforeId, afterId] = handleId.split(":")
  const beforeIndex = panels.findIndex((panel) => panel.id === beforeId)
  const afterIndex = panels.findIndex((panel) => panel.id === afterId)

  if (beforeIndex === -1 || afterIndex === -1) {
    return {
      beforeId: beforeId || undefined,
      afterId: afterId || undefined,
      valueMax: undefined,
      valueMin: undefined,
      valueNow: undefined,
    }
  }

  const { valueMax, valueMin, valueNow } = calculateAriaValues({
    size,
    panels,
    pivotIndices: [beforeIndex, afterIndex],
  })

  return {
    beforeId,
    afterId,
    valueMax: Math.round(valueMax),
    valueMin: Math.round(valueMin),
    valueNow: valueNow != null ? Math.round(valueNow) : undefined,
  }
}
