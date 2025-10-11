import type { Scope } from "@zag-js/core"
import { itemById, nextById, prevById, queryAll } from "@zag-js/dom-query"
import { first, last } from "@zag-js/utils"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `tabs:${ctx.id}`
export const getListId = (ctx: Scope) => ctx.ids?.list ?? `tabs:${ctx.id}:list`
export const getContentId = (ctx: Scope, id: string) => ctx.ids?.content?.(id) ?? `tabs:${ctx.id}:content-${id}`
export const getTriggerId = (ctx: Scope, id: string) => ctx.ids?.trigger?.(id) ?? `tabs:${ctx.id}:trigger-${id}`
export const getIndicatorId = (ctx: Scope) => ctx.ids?.indicator ?? `tabs:${ctx.id}:indicator`

export const getListEl = (ctx: Scope) => ctx.getById(getListId(ctx))
export const getContentEl = (ctx: Scope, id: string) => ctx.getById(getContentId(ctx, id))
export const getTriggerEl = (ctx: Scope, id: string) => ctx.getById(getTriggerId(ctx, id))
export const getIndicatorEl = (ctx: Scope) => ctx.getById(getIndicatorId(ctx))

export const getElements = (ctx: Scope) => {
  const ownerId = CSS.escape(getListId(ctx))
  const selector = `[role=tab][data-ownedby='${ownerId}']:not([disabled])`
  return queryAll(getListEl(ctx), selector)
}

export const getFirstTriggerEl = (ctx: Scope) => first(getElements(ctx))
export const getLastTriggerEl = (ctx: Scope) => last(getElements(ctx))
export const getNextTriggerEl = (ctx: Scope, opts: { value: string; loopFocus?: boolean | undefined }) =>
  nextById(getElements(ctx), getTriggerId(ctx, opts.value), opts.loopFocus)
export const getPrevTriggerEl = (ctx: Scope, opts: { value: string; loopFocus?: boolean | undefined }) =>
  prevById(getElements(ctx), getTriggerId(ctx, opts.value), opts.loopFocus)

export const getOffsetRect = (el: HTMLElement | undefined) => {
  if (!el) {
    return { left: 0, top: 0, width: 0, height: 0 }
  }
  const rect = el.getBoundingClientRect()
  const parent = el.offsetParent?.getBoundingClientRect()
  return {
    left: parent ? rect.left - parent.left : rect.left,
    top: parent ? rect.top - parent.top : rect.top,
    width: rect.width,
    height: rect.height,
  }
}

export const getRectById = (ctx: Scope, id: string) => {
  const tab = itemById(getElements(ctx), getTriggerId(ctx, id))
  return resolveRect(getOffsetRect(tab))
}

export const resolveRect = (rect: Record<"width" | "height" | "left" | "top", number>) => ({
  width: `${rect.width}px`,
  height: `${rect.height}px`,
  left: `${rect.left}px`,
  top: `${rect.top}px`,
})
