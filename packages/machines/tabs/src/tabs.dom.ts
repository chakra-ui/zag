import type { Scope } from "@zag-js/core"
import { itemById, nextById, prevById } from "@zag-js/dom-query"
import { first, last } from "@zag-js/utils"
import { parts } from "./tabs.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getListId = (ctx: Scope) => ctx.ids?.list ?? `${ctx.id}:list`
export const getContentId = (ctx: Scope, value: string) => ctx.ids?.content?.(value) ?? `${ctx.id}:content:${value}`
export const getTriggerId = (ctx: Scope, value: string) => ctx.ids?.trigger?.(value) ?? `${ctx.id}:trigger:${value}`
export const getIndicatorId = (ctx: Scope) => ctx.ids?.indicator ?? `${ctx.id}:indicator`

// Element lookups — use querySelector with merged data attributes
export const getListEl = (ctx: Scope) => ctx.query(ctx.selector(parts.list))
export const getContentEl = (ctx: Scope, value: string) => ctx.getById(getContentId(ctx, value))
export const getTriggerEl = (ctx: Scope, value: string | null) =>
  value != null ? ctx.query(`${ctx.selector(parts.trigger)}[data-value="${value}"]`) : null
export const getIndicatorEl = (ctx: Scope) => ctx.query(ctx.selector(parts.indicator))

export const getElements = (ctx: Scope) => {
  return ctx.queryAll(`${ctx.selector(parts.trigger)}:not([disabled])`)
}

export const getFirstTriggerEl = (ctx: Scope) => first(getElements(ctx))
export const getLastTriggerEl = (ctx: Scope) => last(getElements(ctx))
export const getNextTriggerEl = (ctx: Scope, opts: { value: string; loopFocus?: boolean | undefined }) =>
  nextById(getElements(ctx), getTriggerId(ctx, opts.value), opts.loopFocus)
export const getPrevTriggerEl = (ctx: Scope, opts: { value: string; loopFocus?: boolean | undefined }) =>
  prevById(getElements(ctx), getTriggerId(ctx, opts.value), opts.loopFocus)

export const getOffsetRect = (el: HTMLElement | undefined) => ({
  x: el?.offsetLeft ?? 0,
  y: el?.offsetTop ?? 0,
  width: el?.offsetWidth ?? 0,
  height: el?.offsetHeight ?? 0,
})

export const getRectByValue = (ctx: Scope, value: string) => {
  const tab = itemById(getElements(ctx), getTriggerId(ctx, value))
  return getOffsetRect(tab)
}
