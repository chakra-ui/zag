import type { Scope } from "@zag-js/core"
import { getByTypeahead, isHTMLElement, nextById, prevById, queryAll, type TypeaheadState } from "@zag-js/dom-query"
import { first, last } from "@zag-js/utils"

export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `menu:${ctx.id}:trigger`
export const getContextTriggerId = (ctx: Scope) => ctx.ids?.contextTrigger ?? `menu:${ctx.id}:ctx-trigger`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `menu:${ctx.id}:content`
export const getArrowId = (ctx: Scope) => ctx.ids?.arrow ?? `menu:${ctx.id}:arrow`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `menu:${ctx.id}:popper`
export const getGroupId = (ctx: Scope, id: string) => ctx.ids?.group?.(id) ?? `menu:${ctx.id}:group:${id}`
export const getGroupLabelId = (ctx: Scope, id: string) =>
  ctx.ids?.groupLabel?.(id) ?? `menu:${ctx.id}:group-label:${id}`

export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getPositionerEl = (ctx: Scope) => ctx.getById(getPositionerId(ctx))
export const getTriggerEl = (ctx: Scope) => ctx.getById(getTriggerId(ctx))
export const getItemEl = (ctx: Scope, value: string | null) => (value ? ctx.getById(value) : null)
export const getArrowEl = (ctx: Scope) => ctx.getById(getArrowId(ctx))
export const getContextTriggerEl = (ctx: Scope) => ctx.getById(getContextTriggerId(ctx))

export const getElements = (ctx: Scope) => {
  const ownerId = CSS.escape(getContentId(ctx))
  const selector = `[role^="menuitem"][data-ownedby=${ownerId}]:not([data-disabled])`
  return queryAll(getContentEl(ctx), selector)
}
export const getFirstEl = (ctx: Scope) => first(getElements(ctx))
export const getLastEl = (ctx: Scope) => last(getElements(ctx))
export const getNextEl = (ctx: Scope, opts: { loop?: boolean; value: string | null; loopFocus: boolean }) =>
  nextById(getElements(ctx), opts.value!, opts.loop ?? opts.loopFocus)
export const getPrevEl = (ctx: Scope, opts: { loop?: boolean; value: string | null; loopFocus: boolean }) =>
  prevById(getElements(ctx), opts.value!, opts.loop ?? opts.loopFocus)

export const getElemByKey = (ctx: Scope, opts: { key: string; value: string | null; typeaheadState: TypeaheadState }) =>
  getByTypeahead(getElements(ctx), {
    state: opts.typeaheadState,
    key: opts.key,
    activeId: opts.value,
  })

export const isTargetDisabled = (v: EventTarget | null) => {
  return isHTMLElement(v) && (v.dataset.disabled === "" || v.hasAttribute("disabled"))
}

export const isTriggerItem = (el: HTMLElement | null) => {
  return !!el?.getAttribute("role")?.startsWith("menuitem") && !!el?.hasAttribute("aria-controls")
}

export const getOptionFromItemEl = (el: HTMLElement) => {
  return {
    id: el.id,
    name: el.dataset.name,
    value: el.dataset.value,
    valueText: el.dataset.valueText,
    type: el.dataset.type,
  }
}
