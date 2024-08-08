import { getRelativePoint, type Point } from "@zag-js/dom-event"
import { createScope, queryAll } from "@zag-js/dom-query"
import { dispatchInputValueEvent } from "@zag-js/form-utils"
import { getPercentValue } from "@zag-js/numeric-range"
import { styleGetterFns } from "./slider.style"
import type { MachineContext as Ctx } from "./slider.types"

export const dom = createScope({
  ...styleGetterFns,
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `slider:${ctx.id}`,
  getThumbId: (ctx: Ctx, index: number) => ctx.ids?.thumb?.(index) ?? `slider:${ctx.id}:thumb:${index}`,
  getHiddenInputId: (ctx: Ctx, index: number) => ctx.ids?.hiddenInput?.(index) ?? `slider:${ctx.id}:input:${index}`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `slider:${ctx.id}:control`,
  getTrackId: (ctx: Ctx) => ctx.ids?.track ?? `slider:${ctx.id}:track`,
  getRangeId: (ctx: Ctx) => ctx.ids?.range ?? `slider:${ctx.id}:range`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `slider:${ctx.id}:label`,
  getValueTextId: (ctx: Ctx) => ctx.ids?.valueText ?? `slider:${ctx.id}:value-text`,
  getMarkerId: (ctx: Ctx, value: number) => ctx.ids?.marker?.(value) ?? `slider:${ctx.id}:marker:${value}`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getThumbEl: (ctx: Ctx, index: number) => dom.getById(ctx, dom.getThumbId(ctx, index)),
  getHiddenInputEl: (ctx: Ctx, index: number) => dom.getById<HTMLInputElement>(ctx, dom.getHiddenInputId(ctx, index)),
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getElements: (ctx: Ctx) => queryAll(dom.getControlEl(ctx), "[role=slider]"),
  getFirstEl: (ctx: Ctx) => dom.getElements(ctx)[0],
  getRangeEl: (ctx: Ctx) => dom.getById(ctx, dom.getRangeId(ctx)),

  getValueFromPoint(ctx: Ctx, point: Point) {
    const controlEl = dom.getControlEl(ctx)
    if (!controlEl) return
    const relativePoint = getRelativePoint(point, controlEl)
    const percent = relativePoint.getPercentValue({
      orientation: ctx.orientation,
      dir: ctx.dir,
      inverted: { y: true },
    })
    return getPercentValue(percent, ctx.min, ctx.max, ctx.step)
  },
  dispatchChangeEvent(ctx: Ctx) {
    const valueArray = Array.from(ctx.value)
    valueArray.forEach((value, index) => {
      const inputEl = dom.getHiddenInputEl(ctx, index)
      if (!inputEl) return
      dispatchInputValueEvent(inputEl, { value })
    })
  },
})
