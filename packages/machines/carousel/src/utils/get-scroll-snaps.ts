import { MachineContext } from "../carousel.types"
import { getAlignment } from "./get-alignment"
import { getSlidesToScroll } from "./get-slide-groups"
import { getSlideSizes } from "./get-slide-sizes"

const arrayLast = <T>(array: T[]): T => array[array.length - 1]
const arrayLastIndex = <T>(array: T[]): number => array.length - 1

export function getScrollSnaps(ctx: MachineContext) {
  const { slideSizesWithGaps } = getSlideSizes(ctx)
  const containScroll = true

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
    const containedStartSnap = 0
    const containedEndSnap = arrayLast(snaps) - arrayLast(slideSizesWithGaps)

    const measureFn = getAlignment(ctx.align, ctx.containerSize!)
    const alignments = measureSizes().map(measureFn)

    return groupSlides(snaps)
      .map((snap) => snap[0])
      .map((snap, index, groups) => {
        const isFirst = !index
        const isLast = index === arrayLastIndex(groups)
        if (containScroll && isFirst) {
          return containedStartSnap
        }
        if (containScroll && isLast) {
          return containedEndSnap
        }
        return snap + alignments[index]
      })
  }

  const snaps = measureUnaligned()
  const snapsAligned = measureAligned()

  return {
    snaps,
    snapsAligned,
  }
}
