import { getRelativePoint } from "@zag-js/dom-event"
import { createScope } from "@zag-js/dom-query"
import { dispatchInputValueEvent } from "@zag-js/form-utils"
import { getPercentValue } from "@zag-js/numeric-range"
import { styles } from "./slider.style"
import type { MachineContext as Ctx, Point } from "./slider.types"

export const dom = createScope({
  ...styles,

  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `slider:${ctx.id}`,
  getThumbId: (ctx: Ctx) => ctx.ids?.thumb ?? `slider:${ctx.id}:thumb`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `slider:${ctx.id}:control`,
  getHiddenInputId: (ctx: Ctx) => ctx.ids?.hiddenInput ?? `slider:${ctx.id}:input`,
  getOutputId: (ctx: Ctx) => ctx.ids?.output ?? `slider:${ctx.id}:output`,
  getTrackId: (ctx: Ctx) => ctx.ids?.track ?? `slider:${ctx.id}track`,
  getRangeId: (ctx: Ctx) => ctx.ids?.track ?? `slider:${ctx.id}:range`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `slider:${ctx.id}:label`,
  getMarkerId: (ctx: Ctx, value: number) => `slider:${ctx.id}:marker:${value}`,

  getRootEl: (ctx: Ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getThumbEl: (ctx: Ctx) => dom.getById(ctx, dom.getThumbId(ctx)),
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getHiddenInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getHiddenInputId(ctx)),

  getValueFromPoint(ctx: Ctx, point: Point): number | undefined {
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
    const input = dom.getHiddenInputEl(ctx)
    if (!input) return
    dispatchInputValueEvent(input, { value: ctx.value })
  },
})
