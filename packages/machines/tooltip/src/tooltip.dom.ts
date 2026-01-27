import type { Scope } from "@zag-js/core"
import { queryAll } from "@zag-js/dom-query"
import { isFunction } from "@zag-js/utils"

export const getTriggerId = (scope: Scope, value?: string) => {
  const customId = scope.ids?.trigger
  if (customId != null) return isFunction(customId) ? customId(value) : customId
  return value ? `tooltip:${scope.id}:trigger:${value}` : `tooltip:${scope.id}:trigger`
}

export const getContentId = (scope: Scope) => scope.ids?.content ?? `tooltip:${scope.id}:content`

export const getArrowId = (scope: Scope) => scope.ids?.arrow ?? `tooltip:${scope.id}:arrow`

export const getPositionerId = (scope: Scope) => scope.ids?.positioner ?? `tooltip:${scope.id}:popper`

export const getTriggerEl = (scope: Scope) => scope.getById(getTriggerId(scope))

export const getContentEl = (scope: Scope) => scope.getById(getContentId(scope))

export const getPositionerEl = (scope: Scope) => scope.getById(getPositionerId(scope))

export const getArrowEl = (scope: Scope) => scope.getById(getArrowId(scope))

export const getTriggerEls = (scope: Scope): HTMLElement[] =>
  queryAll<HTMLElement>(scope.getDoc(), `[data-scope="tooltip"][data-part="trigger"][data-ownedby="${scope.id}"]`)

export const getActiveTriggerEl = (scope: Scope, value: string | null): HTMLElement | null => {
  return value == null ? getTriggerEls(scope)[0] : scope.getById(getTriggerId(scope, value))
}
