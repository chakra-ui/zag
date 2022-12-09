import { defineDomHelpers } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./date-picker.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `date-picker:${ctx.id}`,
  getGridId: (ctx: Ctx) => ctx.ids?.grid ?? `date-picker:${ctx.id}:grid`,
  getCellId: (ctx: Ctx, id: string) => ctx.ids?.cell?.(id) ?? `date-picker:${ctx.id}:cell-${id}`,
  getCellTriggerId: (ctx: Ctx, id: string) => ctx.ids?.cellTrigger?.(id) ?? `date-picker:${ctx.id}:cell-trigger-${id}`,

  getGridEl: (ctx: Ctx) => dom.getById(ctx, dom.getGridId(ctx)),
  getFocusedCell: (ctx: Ctx) => {
    const grid = dom.getGridEl(ctx)
    return grid?.querySelector<HTMLElement>("[data-part=cell-trigger][data-focused]")
  },
})
