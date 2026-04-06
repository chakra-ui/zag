import type { Scope } from "@zag-js/core"
import { getFocusables } from "@zag-js/dom-query"
import { isFunction } from "@zag-js/utils"
import { parts } from "./popover.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getAnchorId = (scope: Scope) => scope.ids?.anchor ?? `${scope.id}:anchor`

export const getTriggerId = (scope: Scope, value?: string) => {
  const customId = scope.ids?.trigger
  if (customId != null) return isFunction(customId) ? customId(value) : customId
  return value ? `${scope.id}:trigger:${value}` : `${scope.id}:trigger`
}
export const getContentId = (scope: Scope) => scope.ids?.content ?? `${scope.id}:content`
export const getPositionerId = (scope: Scope) => scope.ids?.positioner ?? `${scope.id}:positioner`
export const getArrowId = (scope: Scope) => scope.ids?.arrow ?? `${scope.id}:arrow`
export const getTitleId = (scope: Scope) => scope.ids?.title ?? `${scope.id}:title`
export const getDescriptionId = (scope: Scope) => scope.ids?.description ?? `${scope.id}:desc`
export const getCloseTriggerId = (scope: Scope) => scope.ids?.closeTrigger ?? `${scope.id}:close`

// Element lookups — use querySelector with merged data attributes
export const getAnchorEl = (scope: Scope) => scope.query(scope.selector(parts.anchor))

export const getTriggerEls = (scope: Scope): HTMLElement[] => scope.queryAll<HTMLElement>(scope.selector(parts.trigger))

export const getActiveTriggerEl = (scope: Scope, value: string | null): HTMLElement | null => {
  if (value == null) return getTriggerEls(scope)[0]
  return scope.query(`${scope.selector(parts.trigger)}[data-value="${value}"]`)
}
export const getContentEl = (scope: Scope) => scope.query(scope.selector(parts.content))
export const getPositionerEl = (scope: Scope) => scope.query(scope.selector(parts.positioner))
export const getTitleEl = (scope: Scope) => scope.query(scope.selector(parts.title))
export const getDescriptionEl = (scope: Scope) => scope.query(scope.selector(parts.description))

export const getFocusableEls = (scope: Scope) => getFocusables(getContentEl(scope))
export const getFirstFocusableEl = (scope: Scope) => getFocusableEls(scope)[0]
