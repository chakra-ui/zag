import { ensure } from "@zag-js/utils"
import type { NormalizedPanelData } from "../splitter.types"
import { fuzzyCompareNumbers, fuzzySizeEqual, fuzzyNumbersEqual } from "./fuzzy"
import { getCollapsedThreshold, resizePanel } from "./resize-panel"

interface Layout {
  delta: number
  initialSize: number[]
  panels: NormalizedPanelData[]
  pivotIndices: number[]
  prevSize: number[]
  trigger: "imperative-api" | "keyboard" | "mouse-or-touch"
}

export function resizeByDelta(props: Layout): number[] {
  let { delta, initialSize, panels, pivotIndices, prevSize, trigger } = props

  if (fuzzyNumbersEqual(delta, 0)) {
    return initialSize
  }

  const nextSize = [...initialSize]

  const [firstPivotIndex, secondPivotIndex] = pivotIndices

  ensure(firstPivotIndex, () => "Invalid first pivot index")
  ensure(secondPivotIndex, () => "Invalid second pivot index")

  let deltaApplied = 0

  // A resizing panel affects the panels before or after it.
  //
  // A negative delta means the panel(s) immediately after the resize handle should grow/expand by decreasing its offset.
  // Other panels may also need to shrink/contract (and shift) to make room, depending on the min weights.
  //
  // A positive delta means the panel(s) immediately before the resize handle should "expand".
  // This is accomplished by shrinking/contracting (and shifting) one or more of the panels after the resize handle.

  {
    // If this is a resize triggered by a keyboard event, our logic for expanding/collapsing is different.
    // We no longer check the halfway threshold because this may prevent the panel from expanding at all.
    if (trigger === "keyboard") {
      {
        // Check if we should expand a collapsed panel
        const index = delta < 0 ? secondPivotIndex : firstPivotIndex
        const panel = panels[index]
        ensure(panel, () => `Panel data not found for index ${index}`)

        const { collapsedSize = 0, collapsible, minSize = 0 } = panel

        if (collapsible) {
          const prevSize = initialSize[index]
          ensure(prevSize, () => `Previous size not found for panel index ${index}`)

          if (fuzzyNumbersEqual(prevSize, collapsedSize)) {
            const localDelta = minSize - prevSize
            if (fuzzyCompareNumbers(localDelta, Math.abs(delta)) > 0) {
              delta = delta < 0 ? 0 - localDelta : localDelta
            }
          }
        }
      }

      {
        // Check if we should collapse a panel at its minimum size
        const index = delta < 0 ? firstPivotIndex : secondPivotIndex
        const panel = panels[index]
        ensure(panel, () => `No panel data found for index ${index}`)

        const { collapsedSize = 0, collapsible, minSize = 0 } = panel

        if (collapsible) {
          const prevSize = initialSize[index]
          ensure(prevSize, () => `Previous size not found for panel index ${index}`)

          if (fuzzyNumbersEqual(prevSize, minSize)) {
            const localDelta = prevSize - collapsedSize
            if (fuzzyCompareNumbers(localDelta, Math.abs(delta)) > 0) {
              delta = delta < 0 ? 0 - localDelta : localDelta
            }
          }
        }
      }
    } else {
      const index = delta < 0 ? secondPivotIndex : firstPivotIndex
      const panel = panels[index]
      ensure(panel, () => `Panel data not found for index ${index}`)

      const { collapsedSize = 0, collapsible, minSize = 0 } = panel
      const prevSize = initialSize[index]

      if (collapsible && prevSize != null && fuzzyCompareNumbers(prevSize, minSize) < 0) {
        const gapSize = minSize - collapsedSize
        if (fuzzyCompareNumbers(prevSize + Math.abs(delta), minSize) < 0) {
          const opens = fuzzyCompareNumbers(Math.abs(delta), getCollapsedThreshold(panel)) > 0
          delta = opens ? (delta < 0 ? -gapSize : gapSize) : 0
        }
      }
    }
  }

  {
    // Pre-calculate max available delta in the opposite direction of our pivot.
    // This will be the maximum amount we're allowed to expand/contract the panels in the primary direction.
    // If this amount is less than the requested delta, adjust the requested delta.
    // If this amount is greater than the requested delta, that's useful information too–
    // as an expanding panel might change from collapsed to min size.

    const increment = delta < 0 ? 1 : -1

    let index = delta < 0 ? secondPivotIndex : firstPivotIndex
    let maxAvailableDelta = 0

    while (true) {
      const prevSize = initialSize[index]
      ensure(prevSize, () => `Previous size not found for panel index ${index}`)

      const maxSafeSize = resizePanel({ panels, index, size: 100, prevSize })
      const delta = maxSafeSize - prevSize

      maxAvailableDelta += delta
      index += increment

      if (index < 0 || index >= panels.length) {
        break
      }
    }

    const minAbsDelta = Math.min(Math.abs(delta), Math.abs(maxAvailableDelta))
    delta = delta < 0 ? 0 - minAbsDelta : minAbsDelta
  }

  {
    // Delta added to a panel needs to be subtracted from other panels (within the constraints that those panels allow).

    const pivotIndex = delta < 0 ? firstPivotIndex : secondPivotIndex
    let index = pivotIndex
    while (index >= 0 && index < panels.length) {
      const deltaRemaining = Math.abs(delta) - Math.abs(deltaApplied)

      const prevSize = initialSize[index]
      ensure(prevSize, () => `Previous size not found for panel index ${index}`)

      const unsafeSize = prevSize - deltaRemaining
      const safeSize = resizePanel({ panels, index, size: unsafeSize, prevSize })

      if (!fuzzyNumbersEqual(prevSize, safeSize)) {
        deltaApplied += prevSize - safeSize

        nextSize[index] = safeSize

        if (
          deltaApplied.toPrecision(3).localeCompare(Math.abs(delta).toPrecision(3), undefined, {
            numeric: true,
          }) >= 0
        ) {
          break
        }
      }

      if (delta < 0) {
        index--
      } else {
        index++
      }
    }
  }

  // If we were unable to resize any of the panels panels, return the previous state.
  // This will essentially bailout and ignore e.g. drags past a panel's boundaries
  if (fuzzySizeEqual(prevSize, nextSize)) {
    return prevSize
  }

  {
    // Now distribute the applied delta to the panels in the other direction
    const pivotIndex = delta < 0 ? secondPivotIndex : firstPivotIndex

    const prevSize = initialSize[pivotIndex]
    ensure(prevSize, () => `Previous size not found for panel index ${pivotIndex}`)

    const unsafeSize = prevSize + deltaApplied
    const safeSize = resizePanel({ panels, index: pivotIndex, size: unsafeSize, prevSize })

    // Adjust the pivot panel before, but only by the amount that surrounding panels were able to shrink/contract.
    nextSize[pivotIndex] = safeSize

    // Edge case where expanding or contracting one panel caused another one to change collapsed state
    if (!fuzzyNumbersEqual(safeSize, unsafeSize)) {
      let deltaRemaining = unsafeSize - safeSize

      const pivotIndex = delta < 0 ? secondPivotIndex : firstPivotIndex
      let index = pivotIndex
      while (index >= 0 && index < panels.length) {
        const prevSize = nextSize[index]
        ensure(prevSize, () => `Previous size not found for panel index ${index}`)

        const unsafeSize = prevSize + deltaRemaining
        const safeSize = resizePanel({ panels, index, size: unsafeSize, prevSize })

        if (!fuzzyNumbersEqual(prevSize, safeSize)) {
          deltaRemaining -= safeSize - prevSize

          nextSize[index] = safeSize
        }

        if (fuzzyNumbersEqual(deltaRemaining, 0)) {
          break
        }

        if (delta > 0) {
          index--
        } else {
          index++
        }
      }
    }
  }

  const totalSize = nextSize.reduce((total, size) => size + total, 0)

  // If our new sizes don't add up to 100%, that means the requested delta can't be applied
  // In that case, fall back to our most recent valid sizes
  if (!fuzzyNumbersEqual(totalSize, 100)) {
    return prevSize
  }

  return nextSize
}
