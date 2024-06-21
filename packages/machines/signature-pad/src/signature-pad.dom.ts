import { createScope, getDataUrl, query } from "@zag-js/dom-query"
import type { MachineContext as Ctx, DataUrlOptions } from "./signature-pad.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `signature-${ctx.id}`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `signature-control-${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `signature-label-${ctx.id}`,
  getHiddenInputId: (ctx: Ctx) => ctx.ids?.hiddenInput ?? `signature-input-${ctx.id}`,

  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getSegmentEl: (ctx: Ctx) => query<SVGElement>(dom.getControlEl(ctx), "[data-part=segment]"),
  getHiddenInputEl: (ctx: Ctx) => dom.getById(ctx, dom.getHiddenInputId(ctx)),

  getDataUrl: (ctx: Ctx, options: DataUrlOptions): Promise<string> => {
    if (ctx.isEmpty) return Promise.resolve("")
    return getDataUrl(dom.getSegmentEl(ctx), options)
  },
})
