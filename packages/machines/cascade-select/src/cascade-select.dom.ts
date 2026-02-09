import { createScope, dispatchInputValueEvent, queryAll } from "@zag-js/dom-query"
import type { Scope } from "@zag-js/core"

export const dom = createScope({
  getRootId: (ctx: Scope) => ctx.ids?.root ?? `cascade-select:${ctx.id}`,
  getLabelId: (ctx: Scope) => ctx.ids?.label ?? `cascade-select:${ctx.id}:label`,
  getControlId: (ctx: Scope) => ctx.ids?.control ?? `cascade-select:${ctx.id}:control`,
  getTriggerId: (ctx: Scope) => ctx.ids?.trigger ?? `cascade-select:${ctx.id}:trigger`,
  getIndicatorId: (ctx: Scope) => ctx.ids?.indicator ?? `cascade-select:${ctx.id}:indicator`,
  getClearTriggerId: (ctx: Scope) => ctx.ids?.clearTrigger ?? `cascade-select:${ctx.id}:clear-trigger`,
  getPositionerId: (ctx: Scope) => ctx.ids?.positioner ?? `cascade-select:${ctx.id}:positioner`,
  getContentId: (ctx: Scope) => ctx.ids?.content ?? `cascade-select:${ctx.id}:content`,
  getHiddenInputId: (ctx: Scope) => ctx.ids?.hiddenInput ?? `cascade-select:${ctx.id}:hidden-input`,
  getListId: (ctx: Scope, value: string) => ctx.ids?.list?.(value) ?? `cascade-select:${ctx.id}:list:${value}`,
  getItemId: (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `cascade-select:${ctx.id}:item:${value}`,

  getRootEl: (ctx: Scope) => dom.getById(ctx, dom.getRootId(ctx)),
  getLabelEl: (ctx: Scope) => dom.getById(ctx, dom.getLabelId(ctx)),
  getControlEl: (ctx: Scope) => dom.getById(ctx, dom.getControlId(ctx)),
  getTriggerEl: (ctx: Scope) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getIndicatorEl: (ctx: Scope) => dom.getById(ctx, dom.getIndicatorId(ctx)),
  getClearTriggerEl: (ctx: Scope) => dom.getById(ctx, dom.getClearTriggerId(ctx)),
  getPositionerEl: (ctx: Scope) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getContentEl: (ctx: Scope) => dom.getById(ctx, dom.getContentId(ctx)),
  getHiddenInputEl: (ctx: Scope) => dom.getById<HTMLInputElement>(ctx, dom.getHiddenInputId(ctx)),
  getListEl: (ctx: Scope, value: string) => dom.getById(ctx, dom.getListId(ctx, value)),
  getListEls: (ctx: Scope) => queryAll(dom.getContentEl(ctx), `[data-part="list"]`),
  getItemEl: (ctx: Scope, value: string) => dom.getById(ctx, dom.getItemId(ctx, value)),
  dispatchInputEvent: (ctx: Scope, value: string) => {
    const inputEl = dom.getHiddenInputEl(ctx)
    if (!inputEl) return
    dispatchInputValueEvent(inputEl, { value })
  },
})

export type DomScope = typeof dom
