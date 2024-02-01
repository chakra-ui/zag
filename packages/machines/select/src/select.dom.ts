import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./select.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `select:${ctx.id}`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `select:${ctx.id}:content`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `select:${ctx.id}:trigger`,
  getClearTriggerId: (ctx: Ctx) => ctx.ids?.clearTrigger ?? `select:${ctx.id}:clear-trigger`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `select:${ctx.id}:label`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `select:${ctx.id}:control`,
  getItemId: (ctx: Ctx, id: string | number) => ctx.ids?.item?.(id) ?? `select:${ctx.id}:option:${id}`,
  getHiddenSelectId: (ctx: Ctx) => ctx.ids?.hiddenSelect ?? `select:${ctx.id}:select`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `select:${ctx.id}:positioner`,
  getItemGroupId: (ctx: Ctx, id: string | number) => ctx.ids?.itemGroup?.(id) ?? `select:${ctx.id}:optgroup:${id}`,
  getItemGroupLabelId: (ctx: Ctx, id: string | number) =>
    ctx.ids?.itemGroupLabel?.(id) ?? `select:${ctx.id}:optgroup-label:${id}`,

  getHiddenSelectEl: (ctx: Ctx) => dom.getById<HTMLSelectElement>(ctx, dom.getHiddenSelectId(ctx)),
  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getClearTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getClearTriggerId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getHighlightedOptionEl(ctx: Ctx) {
    if (!ctx.highlightedValue) return null
    return dom.getById(ctx, dom.getItemId(ctx, ctx.highlightedValue))
  },
})
