import type { NormalizedPanelData, PanelData, PanelSize } from "../splitter.types"

const sizeRegex = /^(-?\d*\.?\d+)(%|px|em|rem|vw|vh)?$/
const percentRegex = /^(-?\d*\.?\d+)%$/

function getRootSize(rootEl: HTMLElement | null, orientation: "horizontal" | "vertical") {
  if (!rootEl) return 0
  const rect = rootEl.getBoundingClientRect()
  return orientation === "horizontal" ? rect.width : rect.height
}

export function getGroupSize(rootEl: HTMLElement | null, orientation: "horizontal" | "vertical") {
  return getRootSize(rootEl, orientation)
}

function toPixelValue(value: number, unit: string, rootEl: HTMLElement) {
  const win = rootEl.ownerDocument.defaultView
  if (!win) return undefined

  switch (unit) {
    case "px":
      return value
    case "em": {
      const fontSize = Number.parseFloat(win.getComputedStyle(rootEl).fontSize)
      return value * fontSize
    }
    case "rem": {
      const fontSize = Number.parseFloat(win.getComputedStyle(rootEl.ownerDocument.documentElement).fontSize)
      return value * fontSize
    }
    case "vw":
      return (value / 100) * win.innerWidth
    case "vh":
      return (value / 100) * win.innerHeight
    default:
      return undefined
  }
}

export function parsePanelSize(
  size: PanelSize | undefined,
  rootEl: HTMLElement | null,
  orientation: "horizontal" | "vertical",
): number | undefined {
  if (size == null) return undefined

  if (typeof size === "number") {
    return size
  }

  const match = size.trim().match(sizeRegex)
  if (!match) return undefined

  const value = Number.parseFloat(match[1])
  if (!Number.isFinite(value)) return undefined

  const unit = match[2]
  if (unit == null || unit === "%") {
    return value
  }

  if (!rootEl) return undefined

  const rootSize = getRootSize(rootEl, orientation)
  if (rootSize === 0) return undefined

  const px = toPixelValue(value, unit, rootEl)
  return px == null ? undefined : (px / rootSize) * 100
}

export function toCssPanelSize(size: PanelSize | undefined): string | undefined {
  if (size == null) return undefined

  if (typeof size === "number") {
    return `${size}%`
  }

  const trimmed = size.trim()
  if (percentRegex.test(trimmed)) {
    return trimmed
  }

  const match = trimmed.match(sizeRegex)
  if (!match) return undefined

  const value = Number.parseFloat(match[1])
  if (!Number.isFinite(value)) return undefined

  const unit = match[2]
  return unit == null ? `${value}%` : `${value}${unit}`
}

export function resolvePanelSizes({
  sizes,
  panels,
  rootEl,
  orientation,
}: {
  sizes: PanelSize[] | undefined
  panels: PanelData[]
  rootEl: HTMLElement | null
  orientation: "horizontal" | "vertical"
}): number[] {
  const nextSize = Array<number>(panels.length)

  let remainingSize = 100
  let numPanelsWithSizes = 0

  for (let index = 0; index < panels.length; index++) {
    const size = parsePanelSize(sizes?.[index], rootEl, orientation)
    if (size == null) continue

    numPanelsWithSizes++
    nextSize[index] = size
    remainingSize -= size
  }

  for (let index = 0; index < panels.length; index++) {
    if (nextSize[index] != null) continue

    const numRemainingPanels = panels.length - numPanelsWithSizes
    const size = numRemainingPanels > 0 ? remainingSize / numRemainingPanels : 0

    numPanelsWithSizes++
    nextSize[index] = size
    remainingSize -= size
  }

  return nextSize
}

export function normalizePanels(
  panels: PanelData[],
  rootEl: HTMLElement | null,
  orientation: "horizontal" | "vertical",
): NormalizedPanelData[] {
  return panels.map((panel) => ({
    ...panel,
    minSize: parsePanelSize(panel.minSize, rootEl, orientation),
    maxSize: parsePanelSize(panel.maxSize, rootEl, orientation),
    collapsedSize: parsePanelSize(panel.collapsedSize, rootEl, orientation),
  }))
}
