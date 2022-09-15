import { defineDomHelpers } from "@zag-js/dom-utils"
import type { Style } from "@zag-js/types"
import type { MachineContext as Ctx } from "./splitter.types"
import { utils } from "./splitter.utils"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `splitter:${ctx.id}`,
  getSeparatorId: (ctx: Ctx, index: number) => ctx.ids?.separator?.(index) ?? `splitter:${ctx.id}:separator:${index}`,
  getPaneId: (ctx: Ctx, index: number) => ctx.ids?.pane?.(index) ?? `splitter:${ctx.id}:pane:${index}`,

  getSeparatorEl: (ctx: Ctx, index: number) => dom.getById(ctx, dom.getSeparatorId(ctx, index)),
  getPaneEl: (ctx: Ctx, index: number) => dom.getById(ctx, dom.getPaneId(ctx, index)),

  getCursor(ctx: Ctx, index: number) {
    if (ctx.fixed) return "default"
    const x = ctx.isHorizontal
    let cursor: Style["cursor"] = x ? "col-resize" : "row-resize"
    const value = utils.getValueAtIndex(ctx.values, index)
    const min = utils.getValueAtIndex(ctx.min, index)
    const max = utils.getValueAtIndex(ctx.max, index)

    if (value === min) cursor = x ? "e-resize" : "s-resize"
    if (value === max) cursor = x ? "w-resize" : "n-resize"
    return cursor
  },
})
