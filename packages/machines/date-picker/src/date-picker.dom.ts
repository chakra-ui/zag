import { defineDomHelpers, queryAll } from "@zag-js/dom-utils"
import { nextIndex, prevIndex } from "@zag-js/utils"
import type { MachineContext as Ctx } from "./date-picker.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `date-picker:${ctx.id}`,
  getGridId: (ctx: Ctx) => ctx.ids?.grid ?? `date-picker:${ctx.id}:grid`,
  getCellId: (ctx: Ctx, id: string) => ctx.ids?.cell?.(id) ?? `date-picker:${ctx.id}:cell-${id}`,
  getCellTriggerId: (ctx: Ctx, id: string) => ctx.ids?.cellTrigger?.(id) ?? `date-picker:${ctx.id}:cell-trigger-${id}`,
  getPrevTriggerId: (ctx: Ctx) => `date-picker:${ctx.id}:prev-trigger`,
  getNextTriggerId: (ctx: Ctx) => `date-picker:${ctx.id}:next-trigger`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `date-picker:${ctx.id}:control`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `date-picker:${ctx.id}:trigger`,
  getSegmentId: (ctx: Ctx, id: string) => `date-picker:${ctx.id}:${id}`,
  getFieldId: (ctx: Ctx) => ctx.ids?.control ?? `date-picker:${ctx.id}:field`,
  getGroupId: (ctx: Ctx) => ctx.ids?.control ?? `date-picker:${ctx.id}:group`,

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
