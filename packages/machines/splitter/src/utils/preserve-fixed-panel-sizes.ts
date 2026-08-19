/**
 * This code was modified from react-resizable-panels by Brian Vaughn
 * @see https://github.com/bvaughn/react-resizable-panels
 */

import type { NormalizedPanelData } from "../splitter.types"
import { fuzzyNumbersEqual } from "./fuzzy"

export function preserveFixedPanelSizes({
  panels,
  prevLayout,
  prevGroupSize,
  nextGroupSize,
}: {
  panels: NormalizedPanelData[]
  prevLayout: number[]
  prevGroupSize: number
  nextGroupSize: number
}): number[] {
  if (prevGroupSize <= 0 || nextGroupSize <= 0) {
    return prevLayout
  }

  const nextLayout = [...prevLayout]
  const relativeIndices: number[] = []

  let fixedTotal = 0
  let relativeTotal = 0

  panels.forEach((panel, index) => {
    if (panel.resizeBehavior === "preserve-pixel-size") {
      const prevPixelSize = (prevLayout[index] / 100) * prevGroupSize
      const nextPercentSize = (prevPixelSize / nextGroupSize) * 100
      nextLayout[index] = nextPercentSize
      fixedTotal += nextPercentSize
    } else {
      relativeIndices.push(index)
      relativeTotal += prevLayout[index]
    }
  })

  if (relativeIndices.length === 0) {
    const total = nextLayout.reduce((accumulated, current) => accumulated + current, 0)
    if (fuzzyNumbersEqual(total, 100)) {
      return nextLayout
    }

    if (total <= 0) {
      return prevLayout
    }

    const scale = 100 / total
    return nextLayout.map((size) => size * scale)
  }

  const remainingSize = 100 - fixedTotal

  if (remainingSize <= 0) {
    const total = nextLayout.reduce((accumulated, current) => accumulated + current, 0)
    if (fuzzyNumbersEqual(total, 100)) {
      return nextLayout
    }

    const scale = 100 / Math.max(total, 1)
    return nextLayout.map((size) => size * scale)
  }

  if (fuzzyNumbersEqual(relativeTotal, 0)) {
    const size = remainingSize / relativeIndices.length
    relativeIndices.forEach((index) => {
      nextLayout[index] = size
    })
    return nextLayout
  }

  relativeIndices.forEach((index) => {
    nextLayout[index] = (prevLayout[index] / relativeTotal) * remainingSize
  })

  const total = nextLayout.reduce((accumulated, current) => accumulated + current, 0)
  if (fuzzyNumbersEqual(total, 100)) {
    return nextLayout
  }

  const scale = 100 / total
  return nextLayout.map((size) => size * scale)
}
