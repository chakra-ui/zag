import type { Scope } from "@zag-js/core"
import { nextById, prevById } from "@zag-js/dom-query"
import { first, last } from "@zag-js/utils"
import { parts } from "./toggle-group.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getItemId = (ctx: Scope, value: string) => ctx.ids?.item?.(value) ?? `${ctx.id}:${value}`

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getElements = (ctx: Scope) => {
  return ctx.queryAll(`${ctx.selector(parts.item)}:not([data-disabled])`)
}
export const getFirstEl = (ctx: Scope) => first(getElements(ctx))
export const getLastEl = (ctx: Scope) => last(getElements(ctx))
export const getNextEl = (ctx: Scope, id: string, loopFocus: boolean) => nextById(getElements(ctx), id, loopFocus)
export const getPrevEl = (ctx: Scope, id: string, loopFocus: boolean) => prevById(getElements(ctx), id, loopFocus)
