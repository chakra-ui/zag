import { createScope } from "@zag-js/dom-query"
import type { Scope } from "@zag-js/core"

export const dom = createScope({
  getRootId: (ctx: Scope) => ctx.ids?.root ?? `cascader:${ctx.id}`,
  getLabelId: (ctx: Scope) => ctx.ids?.label ?? `cascader:${ctx.id}:label`,
  getControlId: (ctx: Scope) => ctx.ids?.control ?? `cascader:${ctx.id}:control`,
  getTriggerId: (ctx: Scope) => ctx.ids?.trigger ?? `cascader:${ctx.id}:trigger`,
  getIndicatorId: (ctx: Scope) => ctx.ids?.indicator ?? `cascader:${ctx.id}:indicator`,
  getValueTextId: (ctx: Scope) => ctx.ids?.valueText ?? `cascader:${ctx.id}:value-text`,
  getClearTriggerId: (ctx: Scope) => ctx.ids?.clearTrigger ?? `cascader:${ctx.id}:clear-trigger`,
  getPositionerId: (ctx: Scope) => ctx.ids?.positioner ?? `cascader:${ctx.id}:positioner`,
  getContentId: (ctx: Scope) => ctx.ids?.content ?? `cascader:${ctx.id}:content`,
  getLevelId: (ctx: Scope, level: number) => ctx.ids?.level?.(level) ?? `cascader:${ctx.id}:level:${level}`,
  getLevelContentId: (ctx: Scope, level: number) =>
    ctx.ids?.levelContent?.(level) ?? `cascader:${ctx.id}:level:${level}:content`,
  getItemId: (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `cascader:${ctx.id}:item:${value}`,

  getRootEl: (ctx: Scope) => dom.getById(ctx, dom.getRootId(ctx)),
  getLabelEl: (ctx: Scope) => dom.getById(ctx, dom.getLabelId(ctx)),
  getControlEl: (ctx: Scope) => dom.getById(ctx, dom.getControlId(ctx)),
  getTriggerEl: (ctx: Scope) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getIndicatorEl: (ctx: Scope) => dom.getById(ctx, dom.getIndicatorId(ctx)),
  getValueTextEl: (ctx: Scope) => dom.getById(ctx, dom.getValueTextId(ctx)),
  getClearTriggerEl: (ctx: Scope) => dom.getById(ctx, dom.getClearTriggerId(ctx)),
  getPositionerEl: (ctx: Scope) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getContentEl: (ctx: Scope) => dom.getById(ctx, dom.getContentId(ctx)),
  getLevelEl: (ctx: Scope, level: number) => dom.getById(ctx, dom.getLevelId(ctx, level)),
  getLevelContentEl: (ctx: Scope, level: number) => dom.getById(ctx, dom.getLevelContentId(ctx, level)),
  getItemEl: (ctx: Scope, value: string) => dom.getById(ctx, dom.getItemId(ctx, value)),
})

export type DomScope = typeof dom
