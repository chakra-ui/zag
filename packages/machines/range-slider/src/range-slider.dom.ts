import { getRelativePointValue } from "@zag-js/dom-event"
import { createScope, queryAll } from "@zag-js/dom-query"
import { dispatchInputValueEvent } from "@zag-js/form-utils"
import { getPercentValue } from "@zag-js/numeric-range"
import { styles } from "./range-slider.style"
import type { MachineContext as Ctx } from "./range-slider.types"
import { clampPercent } from "./range-slider.utils"

type Point = { x: number; y: number }

function getPointProgress(ctx: Ctx, point: Point) {
  const el = dom.getControlEl(ctx)!
  const relativePoint = getRelativePointValue(point, el)
  const percentX = relativePoint.x / el.offsetWidth
  const percentY = relativePoint.y / el.offsetHeight

  let percent: number

  if (ctx.isHorizontal) {
    percent = ctx.isRtl ? 1 - percentX : percentX
  } else {
    percent = 1 - percentY
  }

  return clampPercent(percent)
}

export const dom = createScope({
  ...styles,
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `slider:${ctx.id}`,
  getThumbId: (ctx: Ctx, index: number) => ctx.ids?.thumb?.(index) ?? `slider:${ctx.id}:thumb:${index}`,
  getHiddenInputId: (ctx: Ctx, index: number) => `slider:${ctx.id}:input:${index}`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `slider:${ctx.id}:control`,
  getTrackId: (ctx: Ctx) => ctx.ids?.track ?? `slider:${ctx.id}:track`,
  getRangeId: (ctx: Ctx) => ctx.ids?.range ?? `slider:${ctx.id}:range`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `slider:${ctx.id}:label`,
  getOutputId: (ctx: Ctx) => ctx.ids?.output ?? `slider:${ctx.id}:output`,
  getMarkerId: (ctx: Ctx, value: number) => `slider:${ctx.id}:marker:${value}`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getThumbEl: (ctx: Ctx, index: number) => dom.getById(ctx, dom.getThumbId(ctx, index)),
  getHiddenInputEl: (ctx: Ctx, index: number) => dom.getById<HTMLInputElement>(ctx, dom.getHiddenInputId(ctx, index)),
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getElements: (ctx: Ctx) => queryAll(dom.getControlEl(ctx), "[role=slider]"),
  getFirstEl: (ctx: Ctx) => dom.getElements(ctx)[0],
  getRangeEl: (ctx: Ctx) => dom.getById(ctx, dom.getRangeId(ctx)),

  getValueFromPoint(ctx: Ctx, point: Point) {
    const percent = getPointProgress(ctx, point)
    return getPercentValue(percent, ctx.min, ctx.max, ctx.step)
  },
  dispatchChangeEvent(ctx: Ctx) {
    const valueArray = Array.from(ctx.value)
    valueArray.forEach((value, index) => {
      const input = dom.getHiddenInputEl(ctx, index)
      if (!input) return
      dispatchInputValueEvent(input, value)
    })
  },
})
