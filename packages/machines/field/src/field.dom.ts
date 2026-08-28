import type { Scope } from "@zag-js/core"
import { parts } from "./field.anatomy"
import type { ValidityMatch } from "./field.types"

export type FieldControlElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? ctx.id
export const getItemControlId = (ctx: Scope, item: string) => `${ctx.id}:item:${item}`
export const getControlId = (ctx: Scope, target?: string) =>
  ctx.ids?.control ?? (target ? getItemControlId(ctx, target) : `${ctx.id}:control`)
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getErrorTextId = (ctx: Scope, match?: ValidityMatch | boolean, id?: string) => {
  if (id) return id
  if (typeof match === "string") return `${ctx.id}:error-text:${match}`
  return ctx.ids?.errorText ?? `${ctx.id}:error-text`
}
export const getHelperTextId = (ctx: Scope) => ctx.ids?.helperText ?? `${ctx.id}:helper-text`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getControlEl = (ctx: Scope, target?: string) => ctx.getById<FieldControlElement>(getControlId(ctx, target))

export const getVisibleErrorTextIds = (ctx: Scope) =>
  ctx
    .queryAll<HTMLElement>(ctx.selector(parts.errorText))
    .filter((el) => !el.hidden && el.id)
    .map((el) => el.id)
