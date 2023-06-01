import type { MachineContext as Ctx, NormalizedPanelData } from "./splitter.types"

function validateSize(key: string, size: number) {
  if (Math.floor(size) > 100) {
    throw new Error(`Total ${key} of panels cannot be greater than 100`)
  }
}

export function getNormalizedPanels(ctx: Ctx): NormalizedPanelData {
  let numOfPanelsWithoutSize = 0
  let totalSize = 0
  let totalMinSize = 0

  const panels = ctx.size.map((panel) => {
    const minSize = panel.minSize ?? 0
    const maxSize = panel.maxSize ?? 100

    totalMinSize += minSize

    if (panel.size == null) {
      numOfPanelsWithoutSize++
    } else {
      totalSize += panel.size
    }

    return {
      ...panel,
      minSize,
      maxSize,
    }
  })

  validateSize("minSize", totalMinSize)
  validateSize("size", totalSize)

  let end = 0
  let remainingSize = 0

  const result = panels.map((panel) => {
    let start = end

    if (panel.size != null) {
      end += panel.size
      remainingSize = panel.size - panel.minSize
      return {
        ...panel,
        start,
        end,
        remainingSize,
      }
    }

    const size = (100 - totalSize) / numOfPanelsWithoutSize
    end += size
    remainingSize = size - panel.minSize

    return { ...panel, size, start, end, remainingSize }
  })

  return result as NormalizedPanelData
}

export function getHandlePanels(ctx: Ctx, id = ctx.activeResizeId) {
  const [beforeId, afterId] = id?.split(":") ?? []
  if (!beforeId || !afterId) return

  const beforeIndex = ctx.previousPanels.findIndex((panel) => panel.id === beforeId)
  const afterIndex = ctx.previousPanels.findIndex((panel) => panel.id === afterId)
  if (beforeIndex === -1 || afterIndex === -1) return

  const before = ctx.previousPanels[beforeIndex]
  const after = ctx.previousPanels[afterIndex]

  return {
    before: {
      ...before,
      index: beforeIndex,
    },
    after: {
      ...after,
      index: afterIndex,
    },
  }
}

export function getHandleBounds(ctx: Ctx, id = ctx.activeResizeId) {
  const panels = getHandlePanels(ctx, id)
  if (!panels) return

  const { before, after } = panels

  return {
    min: Math.max(before.start + before.minSize, after.end - after.maxSize),
    max: Math.min(after.end - after.minSize, before.maxSize + before.start),
  }
}

export function getPanelBounds(ctx: Ctx, id?: string | null) {
  const bounds = getHandleBounds(ctx, id)
  const panels = getHandlePanels(ctx, id)

  if (!bounds || !panels) return
  const { before, after } = panels

  const beforeMin = Math.abs(before.start - bounds.min)
  const afterMin = after.size + (before.size - beforeMin)

  const beforeMax = Math.abs(before.start - bounds.max)
  const afterMax = after.size - (beforeMax - before.size)

  return {
    before: {
      index: before.index,
      min: beforeMin,
      max: beforeMax,
      isAtMin: beforeMin === before.size,
      isAtMax: beforeMax === before.size,
      up(step: number) {
        return Math.min(before.size + step, beforeMax)
      },
      down(step: number) {
        return Math.max(before.size - step, beforeMin)
      },
    },
    after: {
      index: after.index,
      min: afterMin,
      max: afterMax,
      isAtMin: afterMin === after.size,
      isAtMax: afterMax === after.size,
      up(step: number) {
        return Math.min(after.size + step, afterMin)
      },
      down(step: number) {
        return Math.max(after.size - step, afterMax)
      },
    },
  }
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
