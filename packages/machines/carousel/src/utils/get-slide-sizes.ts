import type { MachineContext } from "../carousel.types"

export type SlideSizesType = {
  slideSizes: number[]
  slideSizesWithGaps: number[]
}

export function getSlideSizes(ctx: MachineContext): SlideSizesType {
  const startGap = measureStartGap()

  function measureStartGap(): number {
    if (!ctx.containerRect) return 0
    const slideRect = ctx.slideRects[0]
    return Math.abs(ctx.containerRect[ctx.startEdge] - slideRect[ctx.startEdge])
  }

  function measureWithGaps(): number[] {
    return ctx.slideRects.map((rect, index, rects) => {
      const isFirst = !index
      if (isFirst) return Math.abs(slideSizes[index] + startGap)

      const isLast = index === rects.length - 1
      if (isLast) return Math.abs(slideSizes[index])

      return Math.abs(rects[index + 1][ctx.startEdge] - rect[ctx.startEdge])
    })
  }

  const slideSizes = ctx.slideRects.map((slideRect) => {
    return ctx.isVertical ? slideRect.height : slideRect.width
  })
  const slideSizesWithGaps = measureWithGaps()

  return {
    slideSizes,
    slideSizesWithGaps,
  }
}
