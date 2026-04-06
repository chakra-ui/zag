import { createScope, dispatchInputValueEvent, queryAll } from "@zag-js/dom-query"
import type { Scope } from "@zag-js/core"
import { parts } from "./cascade-select.anatomy"

export const dom = createScope({
  getRootId: (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`,
  getLabelId: (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`,
  getControlId: (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`,
  getTriggerId: (ctx: Scope) => ctx.ids?.trigger ?? `${ctx.id}:trigger`,
  getIndicatorId: (ctx: Scope) => ctx.ids?.indicator ?? `${ctx.id}:indicator`,
  getClearTriggerId: (ctx: Scope) => ctx.ids?.clearTrigger ?? `${ctx.id}:clear-trigger`,
  getPositionerId: (ctx: Scope) => ctx.ids?.positioner ?? `${ctx.id}:positioner`,
  getContentId: (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`,
  getHiddenInputId: (ctx: Scope) => ctx.ids?.hiddenInput ?? `${ctx.id}:hidden-input`,
  getListId: (ctx: Scope, value: string) => ctx.ids?.list?.(value) ?? `${ctx.id}:list:${value}`,
  getItemId: (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `${ctx.id}:item:${value}`,

  getRootEl: (ctx: Scope) => ctx.query(ctx.selector(parts.root)),
  getLabelEl: (ctx: Scope) => ctx.query(ctx.selector(parts.label)),
  getControlEl: (ctx: Scope) => ctx.query(ctx.selector(parts.control)),
  getTriggerEl: (ctx: Scope) => ctx.query(ctx.selector(parts.trigger)),
  getIndicatorEl: (ctx: Scope) => ctx.query(ctx.selector(parts.indicator)),
  getClearTriggerEl: (ctx: Scope) => ctx.query(ctx.selector(parts.clearTrigger)),
  getPositionerEl: (ctx: Scope) => ctx.query(ctx.selector(parts.positioner)),
  getContentEl: (ctx: Scope) => ctx.query(ctx.selector(parts.content)),
  getHiddenInputEl: (ctx: Scope) => dom.getById<HTMLInputElement>(ctx, dom.getHiddenInputId(ctx)),
  getListEl: (ctx: Scope, value: string) => ctx.query(`${ctx.selector(parts.list)}[data-value="${value}"]`),
  getListEls: (ctx: Scope) => queryAll(dom.getContentEl(ctx), `[${parts.list.attr}]`),
  getItemEl: (ctx: Scope, value: string) => ctx.query(`${ctx.selector(parts.item)}[data-value="${value}"]`),
  dispatchInputEvent: (ctx: Scope, value: string) => {
    const inputEl = dom.getHiddenInputEl(ctx)
    if (!inputEl) return
    dispatchInputValueEvent(inputEl, { value })
  },
})

export type DomScope = typeof dom
