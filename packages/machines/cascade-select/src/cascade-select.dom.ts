import { createScope } from "@zag-js/dom-query"
import type { Scope } from "@zag-js/core"

export const dom = createScope({
  getRootId: (ctx: Scope) => ctx.ids?.root ?? `cascade-select:${ctx.id}`,
  getLabelId: (ctx: Scope) => ctx.ids?.label ?? `cascade-select:${ctx.id}:label`,
  getControlId: (ctx: Scope) => ctx.ids?.control ?? `cascade-select:${ctx.id}:control`,
  getTriggerId: (ctx: Scope) => ctx.ids?.trigger ?? `cascade-select:${ctx.id}:trigger`,
  getIndicatorId: (ctx: Scope) => ctx.ids?.indicator ?? `cascade-select:${ctx.id}:indicator`,
  getValueTextId: (ctx: Scope) => ctx.ids?.valueText ?? `cascade-select:${ctx.id}:value-text`,
  getClearTriggerId: (ctx: Scope) => ctx.ids?.clearTrigger ?? `cascade-select:${ctx.id}:clear-trigger`,
  getPositionerId: (ctx: Scope) => ctx.ids?.positioner ?? `cascade-select:${ctx.id}:positioner`,
  getContentId: (ctx: Scope) => ctx.ids?.content ?? `cascade-select:${ctx.id}:content`,
  getHiddenSelectId: (ctx: Scope) => ctx.ids?.hiddenSelect ?? `cascade-select:${ctx.id}:hidden-select`,
  getLevelId: (ctx: Scope, level: number) => ctx.ids?.level?.(level) ?? `cascade-select:${ctx.id}:level:${level}`,
  getItemId: (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `cascade-select:${ctx.id}:item:${value}`,

  getRootEl: (ctx: Scope) => dom.getById(ctx, dom.getRootId(ctx)),
  getLabelEl: (ctx: Scope) => dom.getById(ctx, dom.getLabelId(ctx)),
  getControlEl: (ctx: Scope) => dom.getById(ctx, dom.getControlId(ctx)),
  getTriggerEl: (ctx: Scope) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getIndicatorEl: (ctx: Scope) => dom.getById(ctx, dom.getIndicatorId(ctx)),
  getValueTextEl: (ctx: Scope) => dom.getById(ctx, dom.getValueTextId(ctx)),
  getClearTriggerEl: (ctx: Scope) => dom.getById(ctx, dom.getClearTriggerId(ctx)),
  getPositionerEl: (ctx: Scope) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getContentEl: (ctx: Scope) => dom.getById(ctx, dom.getContentId(ctx)),
  getHiddenSelectEl: (ctx: Scope) => dom.getById(ctx, dom.getHiddenSelectId(ctx)),
  getLevelEl: (ctx: Scope, level: number) => dom.getById(ctx, dom.getLevelId(ctx, level)),
  getItemEl: (ctx: Scope, value: string) => dom.getById(ctx, dom.getItemId(ctx, value)),
})

export type DomScope = typeof dom
