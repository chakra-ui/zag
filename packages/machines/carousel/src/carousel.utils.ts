import { MachineContext } from "./carousel.types"

export const getAlignment = (containerSize: number) => ({
  start: () => 0,
  center: (slideSize: number) => (containerSize - slideSize) / 2,
  end: (slideSize: number) => containerSize - slideSize,
})

export const getViewPercent = (containerSize: number, slideSize: number) => (slideSize / containerSize) * 100

export const getScrollSnap = (ctx: MachineContext) => {
  const containerRect = ctx.containerRect
  if (!containerRect) return []
  const snaps = ctx.slideRects
    .map((rect) => containerRect[ctx.startEdge] - rect[ctx.startEdge])
    .map((snap) => -Math.abs(snap))

  return snaps
}
