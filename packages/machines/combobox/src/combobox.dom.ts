import type { Scope } from "@zag-js/core"
import { query, setCaretToEnd } from "@zag-js/dom-query"
import { parts } from "./combobox.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `${ctx.id}:input`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`
export const getListId = (ctx: Scope) => ctx.ids?.list ?? `${ctx.id}:list`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `${ctx.id}:positioner`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `${ctx.id}:trigger`
export const getClearTriggerId = (ctx: Scope) => ctx.ids?.clearTrigger ?? `${ctx.id}:clear-trigger`
export const getItemGroupId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroup?.(id) ?? `${ctx.id}:optgroup:${id}`
export const getItemGroupLabelId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroupLabel?.(id) ?? `${ctx.id}:optgroup-label:${id}`
export const getItemId = (ctx: Scope, id: string) => ctx.ids?.item?.(id) ?? `${ctx.id}:option:${id}`

export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))
export const getListEl = (ctx: Scope) => ctx.query(ctx.selector(parts.list))
export const getInputEl = (ctx: Scope) => ctx.query<HTMLInputElement>(ctx.selector(parts.input))
export const getPositionerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.positioner))
export const getControlEl = (ctx: Scope) => ctx.query(ctx.selector(parts.control))
export const getTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.trigger))
export const getClearTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.clearTrigger))
export const getItemEl = (ctx: Scope, value: string | null) => {
  if (value == null) return null
  const selector = `[role=option][data-value="${CSS.escape(value)}"]`
  return query(getContentEl(ctx), selector)
}

export const focusInputEl = (ctx: Scope) => {
  const inputEl = getInputEl(ctx)
  if (!ctx.isActiveElement(inputEl)) {
    inputEl?.focus({ preventScroll: true })
  }
  setCaretToEnd(inputEl)
}
export const focusTriggerEl = (ctx: Scope) => {
  const triggerEl = getTriggerEl(ctx)
  if (ctx.isActiveElement(triggerEl)) return
  triggerEl?.focus({ preventScroll: true })
}
