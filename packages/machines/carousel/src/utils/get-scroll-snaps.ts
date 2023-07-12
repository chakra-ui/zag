import type { MachineContext } from "../carousel.types"
import { getAlignment } from "./get-alignment"
import { getLimit } from "./get-limit"
import { getSlidesToScroll } from "./get-slide-groups"
import { getSlideSizes } from "./get-slide-sizes"

const arrayLast = <T>(array: T[]): T => array[arrayLastIndex(array)]
const arrayLastIndex = <T>(array: T[]): number => Math.max(0, array.length - 1)

export function getScrollSnaps(ctx: MachineContext) {
  const { slideSizes, slideSizesWithGaps } = getSlideSizes(ctx)

  const groupSlides = getSlidesToScroll(ctx.containerSize!, slideSizesWithGaps, ctx.slidesPerView)

  function measureSizes(): number[] {
    return groupSlides(ctx.slideRects)
      .map((rects) => arrayLast(rects)[ctx.endEdge] - rects[0][ctx.startEdge])
      .map(Math.abs)
  }

  function measureUnaligned(): number[] {
    return ctx.slideRects
      .map((slideRect) => ctx.containerRect![ctx.startEdge] - slideRect[ctx.startEdge])
      .map((snap) => -Math.abs(snap))
  }

  function measureAligned(): number[] {
    const measureFn = getAlignment(ctx.align, ctx.containerSize!)
    const alignments = measureSizes().map(measureFn)

    return groupSlides(snaps)
      .map((snap) => snap[0])
      .map((snap, index) => snap + alignments[index])
  }

  const snaps = measureUnaligned()
  const snapsAligned = measureAligned()

  const contentSize = -arrayLast(snaps) + arrayLast(slideSizesWithGaps)

  const scrollLimit = getLimit(snaps[snaps.length - 1], snaps[0])
  const scrollProgress = (snapsAligned[ctx.index] - scrollLimit.max) / -scrollLimit.length

  return {
    snaps,
    snapsAligned,
    slideSizes,
    slideSizesWithGaps,
    contentSize,
    scrollLimit,
    scrollProgress: Math.abs(scrollProgress),
  }
}
