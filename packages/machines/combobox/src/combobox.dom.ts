import type { Scope } from "@zag-js/core"
import { query } from "@zag-js/dom-query"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `combobox:${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `combobox:${ctx.id}:label`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `combobox:${ctx.id}:control`
export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `combobox:${ctx.id}:input`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `combobox:${ctx.id}:content`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `combobox:${ctx.id}:popper`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `combobox:${ctx.id}:toggle-btn`
export const getClearTriggerId = (ctx: Scope) => ctx.ids?.clearTrigger ?? `combobox:${ctx.id}:clear-btn`
export const getItemGroupId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroup?.(id) ?? `combobox:${ctx.id}:optgroup:${id}`
export const getItemGroupLabelId = (ctx: Scope, id: string | number) =>
  ctx.ids?.itemGroupLabel?.(id) ?? `combobox:${ctx.id}:optgroup-label:${id}`
export const getItemId = (ctx: Scope, id: string) => ctx.ids?.item?.(id) ?? `combobox:${ctx.id}:option:${id}`

export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getInputId(ctx))
export const getPositionerEl = (ctx: Scope) => ctx.getById(getPositionerId(ctx))
export const getControlEl = (ctx: Scope) => ctx.getById(getControlId(ctx))
export const getTriggerEl = (ctx: Scope) => ctx.getById(getTriggerId(ctx))
export const getClearTriggerEl = (ctx: Scope) => ctx.getById(getClearTriggerId(ctx))
export const getItemEl = (ctx: Scope, value: string | null) => {
  if (value == null) return null
  const selector = `[role=option][data-value="${CSS.escape(value)}"]`
  return query(getContentEl(ctx), selector)
}

export const focusInputEl = (ctx: Scope) => {
  const inputEl = getInputEl(ctx)
  if (ctx.isActiveElement(inputEl)) return
  inputEl?.focus({ preventScroll: true })
}
export const focusTriggerEl = (ctx: Scope) => {
  const triggerEl = getTriggerEl(ctx)
  if (ctx.isActiveElement(triggerEl)) return
  triggerEl?.focus({ preventScroll: true })
}
