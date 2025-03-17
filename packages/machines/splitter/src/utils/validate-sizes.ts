/**
 * This code was modified from react-resizable-panels by Brian Vaughn
 * @see https://github.com/bvaughn/react-resizable-panels
 */

import { ensure, warn } from "@zag-js/utils"
import type { PanelData } from "../splitter.types"
import { fuzzyNumbersEqual } from "./fuzzy"
import { resizePanel } from "./resize-panel"

export function validateSizes({ size: prevSize, panels }: { size: number[]; panels: PanelData[] }): number[] {
  const nextSize = [...prevSize]
  const nextSizeTotalSize = nextSize.reduce((accumulated, current) => accumulated + current, 0)

  // Validate size expectations
  if (nextSize.length !== panels.length) {
    throw Error(`Invalid ${panels.length} panel size: ${nextSize.map((size) => `${size}%`).join(", ")}`)
  } else if (!fuzzyNumbersEqual(nextSizeTotalSize, 100) && nextSize.length > 0) {
    // This is not ideal so we should warn about it, but it may be recoverable in some cases
    // (especially if the amount is small)
    warn(
      `WARNING: Invalid size total size: ${nextSize
        .map((size) => `${size}%`)
        .join(", ")}. Size normalization will be applied.`,
    )

    for (let index = 0; index < panels.length; index++) {
      const unsafeSize = nextSize[index]
      ensure(unsafeSize, `No size data found for index ${index}`)
      const safeSize = (100 / nextSizeTotalSize) * unsafeSize
      nextSize[index] = safeSize
    }
  }

  let remainingSize = 0

  // First pass: Validate the proposed size given each panel's constraints
  for (let index = 0; index < panels.length; index++) {
    const unsafeSize = nextSize[index]
    ensure(unsafeSize, `No size data found for index ${index}`)

    const safeSize = resizePanel({ panels, index, size: unsafeSize })

    if (unsafeSize != safeSize) {
      remainingSize += unsafeSize - safeSize

      nextSize[index] = safeSize
    }
  }

  // If there is additional, left over space, assign it to any panel(s) that permits it
  // (It's not worth taking multiple additional passes to evenly distribute)
  if (!fuzzyNumbersEqual(remainingSize, 0)) {
    for (let index = 0; index < panels.length; index++) {
      const prevSize = nextSize[index]
      ensure(prevSize, `No size data found for index ${index}`)
      const unsafeSize = prevSize + remainingSize
      const safeSize = resizePanel({ panels, index, size: unsafeSize })

      if (prevSize !== safeSize) {
        remainingSize -= safeSize - prevSize
        nextSize[index] = safeSize

        // Once we've used up the remainder, bail
        if (fuzzyNumbersEqual(remainingSize, 0)) {
          break
        }
      }
    }
  }

  return nextSize
}
