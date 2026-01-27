import type { Scope } from "@zag-js/core"
import { queryAll } from "@zag-js/dom-query"
import { isFunction } from "@zag-js/utils"

export const getTriggerId = (scope: Scope, value?: string) => {
  const customId = scope.ids?.trigger
  if (customId != null) return isFunction(customId) ? customId(value) : customId
  return value ? `hover-card:${scope.id}:trigger:${value}` : `hover-card:${scope.id}:trigger`
}
export const getContentId = (scope: Scope) => scope.ids?.content ?? `hover-card:${scope.id}:content`
export const getPositionerId = (scope: Scope) => scope.ids?.positioner ?? `hover-card:${scope.id}:popper`
export const getArrowId = (scope: Scope) => scope.ids?.arrow ?? `hover-card:${scope.id}:arrow`

export const getTriggerEl = (scope: Scope) => scope.getById(getTriggerId(scope))
export const getContentEl = (scope: Scope) => scope.getById(getContentId(scope))
export const getPositionerEl = (scope: Scope) => scope.getById(getPositionerId(scope))

export const getTriggerEls = (scope: Scope): HTMLElement[] =>
  queryAll<HTMLElement>(scope.getDoc(), `[data-scope="hover-card"][data-part="trigger"][data-ownedby="${scope.id}"]`)

export const getActiveTriggerEl = (scope: Scope, value: string | null): HTMLElement | null => {
  return value == null ? getTriggerEls(scope)[0] : scope.getById(getTriggerId(scope, value))
}
