import type { Scope } from "@zag-js/core"
import { dispatchInputValueEvent, indexOfId, nextById, prevById } from "@zag-js/dom-query"
import type { ItemProps } from "./tags-input.types"
import { parts } from "./tags-input.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `${ctx.id}:input`
export const getClearTriggerId = (ctx: Scope) => ctx.ids?.clearBtn ?? `${ctx.id}:clear-btn`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `${ctx.id}:hidden-input`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getItemId = (ctx: Scope, opt: ItemProps) =>
  ctx.ids?.item?.(opt) ?? `${ctx.id}:tag:${opt.value}:${opt.index}`
export const getItemDeleteTriggerId = (ctx: Scope, opt: ItemProps) =>
  ctx.ids?.itemDeleteTrigger?.(opt) ?? `${getItemId(ctx, opt)}-delete-btn`
export const getItemInputId = (ctx: Scope, opt: ItemProps) =>
  ctx.ids?.itemInput?.(opt) ?? `${getItemId(ctx, opt)}-input`

export const getEditInputId = (id: string) => `${id}-input`

// Element lookups — use querySelector with merged data attributes
export const getEditInputEl = (ctx: Scope, id: string) => ctx.getById<HTMLInputElement>(getEditInputId(id))

export const getItemEls = (ctx: Scope) => ctx.queryAll(ctx.selector(parts.item))
export const getTagInputEl = (ctx: Scope, opt: ItemProps) => ctx.getById<HTMLInputElement>(getItemInputId(ctx, opt))
export const getRootEl = (ctx: Scope) => ctx.query<HTMLDivElement>(ctx.selector(parts.root))
export const getInputEl = (ctx: Scope) => ctx.query<HTMLInputElement>(ctx.selector(parts.input))
export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))
export const getTagElements = (ctx: Scope) => ctx.queryAll(`${ctx.selector(parts.itemPreview)}:not([data-disabled])`)
export const getFirstEl = (ctx: Scope) => getTagElements(ctx)[0]
export const getLastEl = (ctx: Scope) => getTagElements(ctx)[getTagElements(ctx).length - 1]
export const getPrevEl = (ctx: Scope, id: string) => prevById(getTagElements(ctx), id, false)
export const getNextEl = (ctx: Scope, id: string) => nextById(getTagElements(ctx), id, false)

export const getTagElAtIndex = (ctx: Scope, index: number) => getTagElements(ctx)[index]
export const getIndexOfId = (ctx: Scope, id: string) => indexOfId(getTagElements(ctx), id)
export const isInputFocused = (ctx: Scope) => ctx.isActiveElement(getInputEl(ctx))

export const getTagValue = (ctx: Scope, id: string | null) => {
  if (!id) return null
  const tagEl = ctx.getById(id)
  return tagEl?.dataset.value ?? null
}

export const setHoverIntent = (el: Element) => {
  const tagEl = el.closest<HTMLElement>("[data-tags-input-item-preview]")
  if (!tagEl) return
  tagEl.dataset.deleteIntent = ""
}

export const clearHoverIntent = (el: Element) => {
  const tagEl = el.closest<HTMLElement>("[data-tags-input-item-preview]")
  if (!tagEl) return
  delete tagEl.dataset.deleteIntent
}

export const dispatchInputEvent = (ctx: Scope, value: string) => {
  const inputEl = getHiddenInputEl(ctx)
  if (!inputEl) return
  dispatchInputValueEvent(inputEl, { value })
}
