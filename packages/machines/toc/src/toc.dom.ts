import type { Scope } from "@zag-js/core"
import { getWindow } from "@zag-js/dom-query"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `toc:${ctx.id}`
export const getNavId = (ctx: Scope) => ctx.ids?.nav ?? `toc:${ctx.id}:nav`
export const getTitleId = (ctx: Scope) => ctx.ids?.title ?? `toc:${ctx.id}:title`
export const getListId = (ctx: Scope) => ctx.ids?.list ?? `toc:${ctx.id}:list`
export const getItemId = (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `toc:${ctx.id}:item-${value}`
export const getLinkId = (ctx: Scope, value: string) => ctx.ids?.link?.(value) ?? `toc:${ctx.id}:link-${value}`
export const getIndicatorId = (ctx: Scope) => ctx.ids?.indicator ?? `toc:${ctx.id}:indicator`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getListEl = (ctx: Scope) => ctx.getById(getListId(ctx))
export const getItemEl = (ctx: Scope, value: string | undefined | null) => {
  if (value == null) return null
  return ctx.getById(getItemId(ctx, value))
}
export const getIndicatorEl = (ctx: Scope) => ctx.getById(getIndicatorId(ctx))

const SCROLLABLE_RE = /auto|scroll|overlay|hidden/

const isScrollContainer = (el: HTMLElement) => {
  const { overflowY } = getWindow(el).getComputedStyle(el)
  return SCROLLABLE_RE.test(overflowY) && el.scrollHeight > el.clientHeight
}

export const getScrollEl = (ctx: Scope, itemEl: HTMLElement) => {
  const rootEl = getRootEl(ctx)
  let el = itemEl.parentElement
  while (el && rootEl?.contains(el)) {
    if (isScrollContainer(el)) return el
    el = el.parentElement
  }
  return null
}

/**
 * Get the heading element in the document by its slug/id.
 * This queries the actual document, not the TOC container.
 */
export const getHeadingEl = (ctx: Scope, value: string): HTMLElement | null => {
  const doc = ctx.getDoc()
  return doc.getElementById(value)
}
