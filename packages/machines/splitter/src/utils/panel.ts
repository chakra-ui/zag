/**
 * This code was modified from react-resizable-panels by Brian Vaughn
 * @see https://github.com/bvaughn/react-resizable-panels
 */

import type { Style } from "@zag-js/types"
import { ensure } from "@zag-js/utils"
import type { DragState, PanelData, PanelSize } from "../splitter.types"
import { toCssPanelSize } from "./size"

export function getPanelById<T extends PanelData>(panels: T[], id: string) {
  const panel = panels.find((panel) => panel.id === id)
  ensure(panel, () => `Panel data not found for id "${id}"`)
  return panel
}

export function findPanelDataIndex(panels: PanelData[], panel: PanelData) {
  return panels.findIndex((prevPanel) => prevPanel === panel || prevPanel.id === panel.id)
}

export function findPanelIndex(panels: PanelData[], id: string) {
  return panels.findIndex((panel) => panel.id === id)
}

export function panelDataHelper<T extends PanelData>(panels: T[], panel: T, sizes: number[]) {
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
  size,
  defaultSize,
  dragState,
  resolvedSizes,
  panels,
  panelIndex,
  horizontal,
  precision = 3,
}: {
  size: PanelSize | undefined
  defaultSize: PanelSize | undefined
  resolvedSizes: number[]
  dragState: DragState | null
  panels: PanelData[]
  panelIndex: number
  horizontal: boolean
  precision?: number | undefined
}): Style {
  const resolvedSize = resolvedSizes[panelIndex]
  const layoutSize = size ?? defaultSize
  const panel = panels[panelIndex]

  let flexGrow
  let flexBasis: Style["flexBasis"]
  let flexShrink: Style["flexShrink"] = 1
  const constraintAxis = horizontal ? "Width" : "Height"
  const minSize = panel ? toCssPanelSize(panel.minSize) : undefined
  const maxSize = panel ? toCssPanelSize(panel.maxSize) : undefined
  const layoutCssSize = toCssPanelSize(layoutSize)

  if (resolvedSize == null) {
    // Initial render (before panels have registered themselves)
    // In order to support server rendering, fall back to default size if provided
    if (layoutCssSize != null) {
      if (layoutCssSize.endsWith("%")) {
        flexGrow = Number.parseFloat(layoutCssSize).toPrecision(precision)
      } else {
        flexBasis = getClampedFlexBasis({
          basis: layoutCssSize,
          minSize,
          maxSize,
        })
        flexGrow = "0"
        flexShrink = 0
      }
    } else {
      flexGrow = "1"
    }
  } else if (panels.length === 1) {
    // Special case: Single panel group should always fill full width/height
    flexGrow = "1"
  } else {
    flexGrow = resolvedSize.toPrecision(precision)
  }

  return {
    flexBasis: flexBasis ?? 0,
    flexGrow,
    flexShrink,
    ...(minSize ? { [`min${constraintAxis}`]: minSize } : {}),
    ...(maxSize ? { [`max${constraintAxis}`]: maxSize } : {}),

    // Without this, Panel sizes may be unintentionally overridden by their content
    overflow: "hidden",

    // Disable pointer events inside of a panel during resize
    // This avoid edge cases like nested iframes
    pointerEvents: dragState !== null ? "none" : undefined,
  }
}

function getClampedFlexBasis({
  basis,
  minSize,
  maxSize,
}: {
  basis: string
  minSize: string | undefined
  maxSize: string | undefined
}) {
  return `clamp(${minSize ?? "0%"}, ${basis}, ${maxSize ?? "100%"})`
}

export function getUnsafeDefaultSize({ panels, size: sizes }: { panels: PanelData[]; size: number[] }): number[] {
  const finalSizes = Array<number>(panels.length)

  let numPanelsWithSizes = 0
  let remainingSize = 100

  // Distribute default sizes first
  for (let index = 0; index < panels.length; index++) {
    const panel = panels[index]
    ensure(panel, () => `Panel data not found for index ${index}`)
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
    ensure(panel, () => `Panel data not found for index ${index}`)
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
