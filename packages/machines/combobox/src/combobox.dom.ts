import { createScope } from "@zag-js/dom-query"
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
  getItemId: (ctx: Ctx, id: string) => `combobox:${ctx.id}:option:${id}`,

  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getClearTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getClearTriggerId(ctx)),

  isInputFocused: (ctx: Ctx) => dom.getDoc(ctx).activeElement === dom.getInputEl(ctx),
  getHighlightedItemEl: (ctx: Ctx) => {
    const value = ctx.highlightedValue
    if (value == null) return
    return dom.getContentEl(ctx)?.querySelector<HTMLElement>(`[role=option][data-value="${CSS.escape(value)}"`)
  },
})
