import type { Scope } from "@zag-js/core"
import { parts } from "./toc.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getTitleId = (ctx: Scope) => ctx.ids?.title ?? `${ctx.id}:title`
export const getListId = (ctx: Scope) => ctx.ids?.list ?? `${ctx.id}:list`
export const getItemId = (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `${ctx.id}:item:${value}`
export const getLinkId = (ctx: Scope, value: string) => ctx.ids?.link?.(value) ?? `${ctx.id}:link:${value}`
export const getIndicatorId = (ctx: Scope) => ctx.ids?.indicator ?? `${ctx.id}:indicator`

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getListEl = (ctx: Scope) => ctx.query(ctx.selector(parts.list))
export const getItemEl = (ctx: Scope, value: string | undefined | null) => {
  if (value == null) return null
  return ctx.query(`${ctx.selector(parts.item)}[data-value="${value}"]`)
}
export const getIndicatorEl = (ctx: Scope) => ctx.query(ctx.selector(parts.indicator))

/**
 * Get the heading element in the document by its slug/id.
 * This queries the actual document, not the TOC container.
 */
export const getHeadingEl = (ctx: Scope, value: string): HTMLElement | null => {
  const doc = ctx.getDoc()
  return doc.getElementById(value)
}
