import { defineDomHelpers, queryAll } from "@zag-js/dom-utils"
import { nextIndex, prevIndex } from "@zag-js/utils"
import type { MachineContext as Ctx } from "./date-picker.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => `datepicker:${ctx.id}`,
  getGridId: (ctx: Ctx) => `datepicker:${ctx.id}:grid`,
  getCellId: (ctx: Ctx, id: string) => `datepicker:${ctx.id}:cell-${id}`,
  getCellTriggerId: (ctx: Ctx, id: string) => `datepicker:${ctx.id}:cell-trigger-${id}`,
  getPrevTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:prev-trigger`,
  getNextTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:next-trigger`,
  getControlId: (ctx: Ctx) => `datepicker:${ctx.id}:control`,
  getTriggerId: (ctx: Ctx) => `datepicker:${ctx.id}:trigger`,
  getSegmentId: (ctx: Ctx, id: string) => `datepicker:${ctx.id}:${id}`,
  getFieldId: (ctx: Ctx) => `datepicker:${ctx.id}:field`,
  getGroupId: (ctx: Ctx) => `datepicker:${ctx.id}:group`,

  getGridEl: (ctx: Ctx) => dom.getById(ctx, dom.getGridId(ctx)),
  getFocusedCell: (ctx: Ctx) => {
    const grid = dom.getGridEl(ctx)
    return grid?.querySelector<HTMLElement>("[data-part=cell-trigger][data-focused]")
  },
  getSegmentEls: (ctx: Ctx) => {
    const group = dom.getById(ctx, dom.getGroupId(ctx))
    return queryAll(group, "[data-part=segment], [data-part=trigger]")
  },
  focusNextSegment(ctx: Ctx) {
    const segments = dom.getSegmentEls(ctx)
    const index = nextIndex(segments, segments.indexOf(dom.getActiveElement(ctx)!), { loop: false })
    const next = segments[index]
    next?.focus()
  },
  focusPrevSegment(ctx: Ctx) {
    const segments = dom.getSegmentEls(ctx)
    const index = prevIndex(segments, segments.indexOf(dom.getActiveElement(ctx)!), { loop: false })
    const prev = segments[index]
    prev?.focus()
  },
})
