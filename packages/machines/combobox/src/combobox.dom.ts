import { createScope, query } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./combobox.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `combobox:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `combobox:${ctx.id}:label`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `combobox:${ctx.id}:control`,
  getInputId: (ctx: Ctx) => ctx.ids?.input ?? `combobox:${ctx.id}:input`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `combobox:${ctx.id}:content`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `combobox:${ctx.id}:popper`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `combobox:${ctx.id}:toggle-btn`,
  getClearTriggerId: (ctx: Ctx) => ctx.ids?.clearTrigger ?? `combobox:${ctx.id}:clear-btn`,
  getItemGroupId: (ctx: Ctx, id: string | number) => ctx.ids?.itemGroup?.(id) ?? `combobox:${ctx.id}:optgroup:${id}`,
  getItemGroupLabelId: (ctx: Ctx, id: string | number) =>
    ctx.ids?.itemGroupLabel?.(id) ?? `combobox:${ctx.id}:optgroup-label:${id}`,
  getItemId: (ctx: Ctx, id: string) => ctx.ids?.item?.(id) ?? `combobox:${ctx.id}:option:${id}`,

  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getClearTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getClearTriggerId(ctx)),
  getHighlightedItemEl: (ctx: Ctx) => {
    const value = ctx.highlightedValue
    if (value == null) return
    const selector = `[role=option][data-value="${CSS.escape(value)}"`
    return query(dom.getContentEl(ctx), selector)
  },

  focusInputEl: (ctx: Ctx) => {
    const inputEl = dom.getInputEl(ctx)
    if (dom.isActiveElement(ctx, inputEl)) return
    inputEl?.focus({ preventScroll: true })
  },
  focusTriggerEl: (ctx: Ctx) => {
    const triggerEl = dom.getTriggerEl(ctx)
    if (dom.isActiveElement(ctx, triggerEl)) return
    triggerEl?.focus({ preventScroll: true })
  },
})
