import type { StateMachine } from "@zag-js/core"
import { dispatchInputValueEvent, getPointRelativeToNode, getRoots, queryAll } from "@zag-js/dom-utils"
import { clamp, percentToValue } from "@zag-js/number-utils"
import type { Point } from "@zag-js/rect-utils"
import { closest, getElementRect } from "@zag-js/rect-utils"
import { styles } from "./range-slider.style"
import type { MachineContext as Ctx } from "./range-slider.types"
import { utils } from "./range-slider.utils"

function getPointProgress(ctx: Ctx, point: Point) {
  const el = dom.getControlEl(ctx)!
  const relativePoint = getPointRelativeToNode(point, el)
  const percentX = relativePoint.x / el.offsetWidth
  const percentY = relativePoint.y / el.offsetHeight

  let percent: number

  if (ctx.isHorizontal) {
    percent = ctx.isRtl ? 1 - percentX : percentX
  } else {
    percent = 1 - percentY
  }

  return utils.clampPercent(percent)
}

function getValueFromPoint(ctx: Ctx, point: Point) {
  if (ctx.activeIndex === -1) return
  let percent = getPointProgress(ctx, point)
  return utils.fromPercent(ctx, percent)
}

export const dom = {
  ...styles,
  ...getRoots(),

  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `slider:${ctx.id}`,
  getThumbId: (ctx: Ctx, index: number) => ctx.ids?.thumb?.(index) ?? `slider:${ctx.id}:thumb:${index}`,
  getInputId: (ctx: Ctx, index: number) => `slider:${ctx.id}:input:${index}`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `slider:${ctx.id}:control`,
  getTrackId: (ctx: Ctx) => ctx.ids?.track ?? `slider:${ctx.id}:track`,
  getRangeId: (ctx: Ctx) => ctx.ids?.range ?? `slider:${ctx.id}:range`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `slider:${ctx.id}:label`,
  getOutputId: (ctx: Ctx) => ctx.ids?.output ?? `slider:${ctx.id}:output`,
  getMarkerId: (ctx: Ctx, value: number) => `slider:${ctx.id}:marker:${value}`,

  getRootEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getRootId(ctx)),
  getThumbEl: (ctx: Ctx, index: number) => dom.getRootNode(ctx).getElementById(dom.getThumbId(ctx, index)),
  getInputEl: (ctx: Ctx, index: number) =>
    dom.getRootNode(ctx).getElementById(dom.getInputId(ctx, index)) as HTMLInputElement | null,
  getControlEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getControlId(ctx)),
  getElements: (ctx: Ctx) => queryAll(dom.getControlEl(ctx), "[role=slider]"),
  getFirstEl: (ctx: Ctx) => dom.getElements(ctx)[0],
  getRangeEl: (ctx: Ctx) => dom.getRootNode(ctx)?.getElementById(dom.getRangeId(ctx)),

  getValueFromPoint,
  dispatchChangeEvent(ctx: Ctx) {
    const _values = Array.from(ctx.value)
    _values.forEach((value, index) => {
      const input = dom.getInputEl(ctx, index)
      if (!input) return
      dispatchInputValueEvent(input, value)
    })
  },
}

export function getClosestIndex(ctx: Ctx, evt: StateMachine.AnyEventObject) {
  let index: number

  // get the center point of all thumbs
  const thumbs = dom.getElements(ctx)
  const points = thumbs.map((el) => getElementRect(el)).map((rect) => rect.center)

  // get the closest center point from the event ("pointerdown") point
  const getClosest = closest(...points)
  const closestPoint = getClosest(evt.point)
  index = points.indexOf(closestPoint)

  const control = dom.getControlEl(ctx)
  if (!control) return index

  // when two thumbs are stacked and the user clicks at a point larger than
  // their values, pick the next closest thumb
  const percent = getPointProgress(ctx, evt.point)
  const point = percentToValue(percent, ctx)

  // prettier-ignore
  const axisPoints = ctx.isHorizontal ? 
    points.map((p) => p.x) :
    points.map((p) => p.y)

  const isThumbStacked = new Set(axisPoints).size !== points.length

  if (isThumbStacked && point > ctx.value[index]) {
    index = clamp(index + 1, { min: 0, max: ctx.value.length - 1 })
  }

  return index
}
