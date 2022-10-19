import { queryAll } from "@zag-js/dom-utils"
import type { EventMap, MachineContext as Ctx } from "./pin-input.types"
import { defineHelpers } from "@zag-js/dom-query"

export const dom = defineHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `pin-input:${ctx.id}`,
  getInputId: (ctx: Ctx, id: string) => ctx.ids?.input?.(id) ?? `pin-input:${ctx.id}:${id}`,
  getHiddenInputId: (ctx: Ctx) => ctx.ids?.hiddenInput ?? `pin-input:${ctx.id}:hidden`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `pin-input:${ctx.id}:label`,

  getElements: (ctx: Ctx) => {
    const ownerId = CSS.escape(dom.getRootId(ctx))
    const selector = `input[data-ownedby=${ownerId}]`
    return queryAll<HTMLInputElement>(dom.getRootEl(ctx), selector)
  },
  getFocusedEl: (ctx: Ctx) => dom.getElements(ctx)[ctx.focusedIndex],
  getFirstInputEl: (ctx: Ctx) => dom.getElements(ctx)[0],
  getHiddenInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getHiddenInputId(ctx)),

  getRootEl: (ctx: Ctx) => {
    const rootEl = dom.getById(ctx, dom.getRootId(ctx))
    if (!rootEl) throw new Error("Root element does not exist")
    return rootEl
  },

  emitter: (ctx: Ctx) => dom.createEmitter<EventMap>(ctx, () => dom.getRootEl(ctx)),
  listener: (ctx: Ctx) => dom.createListener<EventMap>(() => dom.getRootEl(ctx)),
})
