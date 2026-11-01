import { queryAll } from "@zag-js/dom-query"
import type { Scope } from "@zag-js/core"
import { parts } from "./accordion.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getItemId = (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `${ctx.id}:item:${value}`
export const getItemContentId = (ctx: Scope, value: string) =>
  ctx.ids?.itemContent?.(value) ?? `${ctx.id}:content:${value}`
export const getItemTriggerId = (ctx: Scope, value: string) =>
  ctx.ids?.itemTrigger?.(value) ?? `${ctx.id}:trigger:${value}`

export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))

export const getItemContentEls = (ctx: Scope) => {
  const ownerId = CSS.escape(ctx.id!)
  return queryAll(getRootEl(ctx), `[${parts.itemContent.attr}='${ownerId}']`)
}

// React renders `hidden` as a boolean
export const syncHiddenUntilFound = (ctx: Scope) => {
  getItemContentEls(ctx).forEach((contentEl) => {
    if (contentEl.hidden) contentEl.setAttribute("hidden", "until-found")
  })
}
