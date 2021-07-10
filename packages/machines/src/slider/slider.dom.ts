import { Point, Range } from "@chakra-ui/utilities"
import { SliderMachineContext } from "./slider.machine"

export function getElementIds(uid: string) {
  return {
    thumb: `slider-${uid}-thumb`,
    root: `slider-${uid}-root`,
    input: `slider-${uid}-input`,
  }
}

export function getElements(ctx: SliderMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)

  return {
    thumb: doc.getElementById(ids.thumb),
    root: doc.getElementById(ids.root),
    input: doc.getElementById(ids.input),
  }
}

export function pointToValue(ctx: SliderMachineContext, info: Point) {
  const { root } = getElements(ctx)
  if (!root) return

  const point = info.relativeToNode(root)
  const percent = new Range({ min: 0, max: 1, value: point.xPercent }).clamp()
  const range = new Range(ctx).fromPercent(percent)
  return range.clone().snapToStep(range).valueOf()
}
