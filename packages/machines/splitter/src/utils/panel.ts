/**
 * This code was modified from react-resizable-panels by Brian Vaughn
 * @see https://github.com/bvaughn/react-resizable-panels
 */

import type { Style } from "@zag-js/types"
import { ensure } from "@zag-js/utils"
import type { DragState, PanelData } from "../splitter.types"

export function getPanelById(panels: PanelData[], id: string) {
  const panel = panels.find((panel) => panel.id === id)
  ensure(panel, `Panel data not found for id "${id}"`)
  return panel
}

export function findPanelDataIndex(panels: PanelData[], panel: PanelData) {
  return panels.findIndex((prevPanel) => prevPanel === panel || prevPanel.id === panel.id)
}

export function findPanelIndex(panels: PanelData[], id: string) {
  return panels.findIndex((panel) => panel.id === id)
}

export function panelDataHelper(panels: PanelData[], panel: PanelData, sizes: number[]) {
  const index = findPanelIndex(panels, panel.id)
  const pivotIndices = index === panels.length - 1 ? [index - 1, index] : [index, index + 1]
  const panelSize = sizes[index]
  return { ...panel, panelSize, pivotIndices }
}

export function sortPanels(panels: PanelData[]) {
  return panels.sort((panelA, panelB) => {
    const orderA = panelA.order
    const orderB = panelB.order
    if (orderA == null && orderB == null) {
      return 0
    } else if (orderA == null) {
      return -1
    } else if (orderB == null) {
      return 1
    } else {
      return orderA - orderB
    }
  })
}

export function getPanelLayout(panels: PanelData[]) {
  return panels
    .map((panel) => panel.id)
    .sort()
    .join(":")
}

export function serializePanels(panels: PanelData[]) {
  const keys = panels.map((panel) => panel.id)
  const sortedKeys = keys.sort()
  const serialized = sortedKeys.map((key) => {
    const panel = panels.find((panel) => panel.id === key)
    return JSON.stringify(panel)
  })
  return serialized.join(",")
}

// the % of the group's overall space this panel should occupy.
export function getPanelFlexBoxStyle({
  defaultSize,
  dragState,
  sizes,
  panels,
  panelIndex,
  precision = 3,
}: {
  defaultSize: number | undefined
  sizes: number[]
  dragState: DragState | null
  panels: PanelData[]
  panelIndex: number
  precision?: number
}): Style {
  const size = sizes[panelIndex]

  let flexGrow
  if (size == null) {
    // Initial render (before panels have registered themselves)
    // In order to support server rendering, fall back to default size if provided
    flexGrow = defaultSize != undefined ? defaultSize.toPrecision(precision) : "1"
  } else if (panels.length === 1) {
    // Special case: Single panel group should always fill full width/height
    flexGrow = "1"
  } else {
    flexGrow = size.toPrecision(precision)
  }

  return {
    flexBasis: 0,
    flexGrow,
    flexShrink: 1,

    // Without this, Panel sizes may be unintentionally overridden by their content
    overflow: "hidden",

    // Disable pointer events inside of a panel during resize
    // This avoid edge cases like nested iframes
    pointerEvents: dragState !== null ? "none" : undefined,
  }
}

export function getUnsafeDefaultSize({ panels, size: sizes }: { panels: PanelData[]; size: number[] }): number[] {
  const finalSizes = Array<number>(panels.length)

  let numPanelsWithSizes = 0
  let remainingSize = 100

  // Distribute default sizes first
  for (let index = 0; index < panels.length; index++) {
    const panel = panels[index]
    ensure(panel, `Panel data not found for index ${index}`)
    const defaultSize = sizes[index]

    if (defaultSize != null) {
      numPanelsWithSizes++
      finalSizes[index] = defaultSize
      remainingSize -= defaultSize
    }
  }

  // Remaining size should be distributed evenly between panels without default sizes
  for (let index = 0; index < panels.length; index++) {
    const panel = panels[index]
    ensure(panel, `Panel data not found for index ${index}`)
    const defaultSize = sizes[index]

    if (defaultSize != null) {
      continue
    }

    const numRemainingPanels = panels.length - numPanelsWithSizes
    const size = remainingSize / numRemainingPanels

    numPanelsWithSizes++
    finalSizes[index] = size
    remainingSize -= size
  }

  return finalSizes
}
