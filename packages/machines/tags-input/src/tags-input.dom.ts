import type { Scope } from "@zag-js/core"
import { dispatchInputValueEvent, indexOfId, isActiveElement, nextById, prevById, queryAll } from "@zag-js/dom-query"
import type { ItemProps } from "./tags-input.types"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `tags-input:${ctx.id}`
export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `tags-input:${ctx.id}:input`
export const getClearTriggerId = (ctx: Scope) => ctx.ids?.clearBtn ?? `tags-input:${ctx.id}:clear-btn`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `tags-input:${ctx.id}:hidden-input`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `tags-input:${ctx.id}:label`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `tags-input:${ctx.id}:control`
export const getItemId = (ctx: Scope, opt: ItemProps) =>
  ctx.ids?.item?.(opt) ?? `tags-input:${ctx.id}:tag:${opt.value}:${opt.index}`
export const getItemDeleteTriggerId = (ctx: Scope, opt: ItemProps) =>
  ctx.ids?.itemDeleteTrigger?.(opt) ?? `${getItemId(ctx, opt)}:delete-btn`
export const getItemInputId = (ctx: Scope, opt: ItemProps) =>
  ctx.ids?.itemInput?.(opt) ?? `${getItemId(ctx, opt)}:input`

export const getEditInputId = (id: string) => `${id}:input`
export const getEditInputEl = (ctx: Scope, id: string) => ctx.getById<HTMLInputElement>(getEditInputId(id))

export const getItemEls = (ctx: Scope) => queryAll(getRootEl(ctx), `[data-part=item]`)
export const getTagInputEl = (ctx: Scope, opt: ItemProps) => ctx.getById<HTMLInputElement>(getItemInputId(ctx, opt))
export const getRootEl = (ctx: Scope) => ctx.getById<HTMLDivElement>(getRootId(ctx))
export const getInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getInputId(ctx))
export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))
export const getTagElements = (ctx: Scope) => queryAll(getRootEl(ctx), `[data-part=item-preview]:not([data-disabled])`)
export const getFirstEl = (ctx: Scope) => getTagElements(ctx)[0]
export const getLastEl = (ctx: Scope) => getTagElements(ctx)[getTagElements(ctx).length - 1]
export const getPrevEl = (ctx: Scope, id: string) => prevById(getTagElements(ctx), id, false)
export const getNextEl = (ctx: Scope, id: string) => nextById(getTagElements(ctx), id, false)

export const getTagElAtIndex = (ctx: Scope, index: number) => getTagElements(ctx)[index]
export const getIndexOfId = (ctx: Scope, id: string) => indexOfId(getTagElements(ctx), id)
export const isInputFocused = (ctx: Scope) => isActiveElement(getInputEl(ctx))

export const getTagValue = (ctx: Scope, id: string | null) => {
  if (!id) return null
  const tagEl = ctx.getById(id)
  return tagEl?.dataset.value ?? null
}

export const setHoverIntent = (el: Element) => {
  const tagEl = el.closest<HTMLElement>("[data-part=item-preview]")
  if (!tagEl) return
  tagEl.dataset.deleteIntent = ""
}

export const clearHoverIntent = (el: Element) => {
  const tagEl = el.closest<HTMLElement>("[data-part=item-preview]")
  if (!tagEl) return
  delete tagEl.dataset.deleteIntent
}

export const dispatchInputEvent = (ctx: Scope, value: string) => {
  const inputEl = getHiddenInputEl(ctx)
  if (!inputEl) return
  dispatchInputValueEvent(inputEl, { value })
}
