import type { Scope } from "@zag-js/core"
import { isFunction } from "@zag-js/utils"
import { parts } from "./tooltip.anatomy"

// ID generators — kept for ARIA attributes in connect
export const getTriggerId = (scope: Scope, value?: string) => {
  const customId = scope.ids?.trigger
  if (customId != null) return isFunction(customId) ? customId(value) : customId
  return value ? `${scope.id}:trigger:${value}` : `${scope.id}:trigger`
}

export const getContentId = (scope: Scope) => scope.ids?.content ?? `${scope.id}:content`

export const getArrowId = (scope: Scope) => scope.ids?.arrow ?? `${scope.id}:arrow`

export const getPositionerId = (scope: Scope) => scope.ids?.positioner ?? `${scope.id}:popper`

// Element lookups — use querySelector with merged data attributes
export const getTriggerEl = (scope: Scope) => scope.query(scope.selector(parts.trigger))

export const getContentEl = (scope: Scope) => scope.query(scope.selector(parts.content))

export const getPositionerEl = (scope: Scope) => scope.query(scope.selector(parts.positioner))

export const getArrowEl = (scope: Scope) => scope.query(scope.selector(parts.arrow))

export const getTriggerEls = (scope: Scope): HTMLElement[] => scope.queryAll<HTMLElement>(scope.selector(parts.trigger))

export const getActiveTriggerEl = (scope: Scope, value: string | null): HTMLElement | null => {
  if (value == null) return getTriggerEls(scope)[0]
  return scope.query(`${scope.selector(parts.trigger)}[data-value="${value}"]`)
}
