import type { Scope } from "@zag-js/core"
import { nextById, prevById } from "@zag-js/dom-query"
import { first, last } from "@zag-js/utils"
import { parts } from "./toolbar.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `toolbar:${ctx.id}`
export const getItemId = (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `toolbar:${ctx.id}:item:${value}`
export const getGroupId = (ctx: Scope, value: string) => ctx.ids?.group?.(value) ?? `toolbar:${ctx.id}:group:${value}`

export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))

export const getElements = (ctx: Scope): HTMLElement[] => {
  const root = getRootEl(ctx)
  if (!root) return []
  const els = ctx.queryAll<HTMLElement>(`${ctx.selector(parts.item)}, [data-toggle-group-item]`)
  return els.filter((el) => {
    if (el.closest(ctx.selector(parts.root)) !== root) return false
    return !el.hasAttribute("data-disabled") || el.hasAttribute("data-focusable-when-disabled")
  })
}

export const getFirstEl = (ctx: Scope) => first(getElements(ctx))
export const getLastEl = (ctx: Scope) => last(getElements(ctx))

export const hasFocusableItem = (ctx: Scope) => getElements(ctx).some((el) => el.tabIndex === 0)

export const getNextEl = (ctx: Scope, loopFocus: boolean) => {
  const id = ctx.getActiveElement()?.id
  const els = getElements(ctx)
  return id ? nextById(els, id, loopFocus) : first(els)
}

export const getPrevEl = (ctx: Scope, loopFocus: boolean) => {
  const id = ctx.getActiveElement()?.id
  const els = getElements(ctx)
  return id ? prevById(els, id, loopFocus) : first(els)
}
