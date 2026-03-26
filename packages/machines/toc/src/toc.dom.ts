import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `toc:${ctx.id}`
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

/**
 * Get the heading element in the document by its slug/id.
 * This queries the actual document, not the TOC container.
 */
export const getHeadingEl = (ctx: Scope, value: string): HTMLElement | null => {
  const doc = ctx.getDoc()
  return doc.getElementById(value)
}
