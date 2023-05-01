import { MachineContext } from "../carousel.types"
import { getLimit } from "./get-limit"
import { getScrollSnaps } from "./get-scroll-snaps"

type Bound = {
  start: number
  end: number
  index: number
}

const slideThreshold = 0

export function getSlidesInView(ctx: MachineContext) {
  const roundingSafety = 0.5
  const slideOffsets = [0]

  const { snaps, slideSizes } = getScrollSnaps(ctx)
  const limit = getLimit(snaps[snaps.length - 1], snaps[0])

  const slideThresholds = slideSizes.map((slideSize) => {
    const thresholdLimit = getLimit(roundingSafety, slideSize - roundingSafety)
    return thresholdLimit.constrain(slideSize * slideThreshold)
  })

  const slideBounds = slideOffsets.reduce((acc: Bound[], offset) => {
    const bounds = snaps.map((snap, index) => ({
      start: snap - slideSizes[index] + slideThresholds[index] + offset,
      end: snap + ctx.containerSize - slideThresholds[index] + offset,
      index,
    }))
    return acc.concat(bounds)
  }, [])

  return (location: number) => {
    const loc = limit.constrain(location)
    return slideBounds.reduce((list: number[], bound) => {
      const { index, start, end } = bound
      const inList = list.includes(index)
      const inView = start < loc && end > loc
      return !inList && inView ? list.concat([index]) : list
    }, [])
  }
}
