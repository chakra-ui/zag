import type { Scope } from "@zag-js/core"
import { getRelativeDirection, nextById, prevById } from "@zag-js/dom-query"
import type { ActivationDirection, Orientation } from "@zag-js/types"
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
  value != null ? ctx.query(`${ctx.selector(parts.trigger)}[data-value="${CSS.escape(value)}"]`) : null
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

// Offsets ignore transforms, so a scaling ancestor doesn't skew the indicator
export const getTriggerRect = (ctx: Scope, triggerEl: HTMLElement) => {
  const container = getIndicatorEl(ctx)?.offsetParent ?? triggerEl.offsetParent
  let x = 0
  let y = 0
  let node: HTMLElement | null = triggerEl
  while (node && node !== container) {
    x += node.offsetLeft
    y += node.offsetTop
    const parent = node.offsetParent as HTMLElement | null
    for (let el: HTMLElement | null = node.parentElement; el && el !== parent; el = el.parentElement) {
      x -= el.scrollLeft
      y -= el.scrollTop
    }
    if (parent && parent !== container) {
      x += parent.clientLeft - parent.scrollLeft
      y += parent.clientTop - parent.scrollTop
    }
    node = parent
  }
  return { x, y, width: triggerEl.offsetWidth, height: triggerEl.offsetHeight }
}

export const getActivationDirection = (
  ctx: Scope,
  prevValue: string | null,
  value: string | null,
  orientation: Orientation,
): ActivationDirection => {
  if (prevValue === value) return "none"
  return getRelativeDirection(getTriggerEl(ctx, prevValue), getTriggerEl(ctx, value), { orientation })
}
