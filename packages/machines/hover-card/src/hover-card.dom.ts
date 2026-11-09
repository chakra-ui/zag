import type { Scope } from "@zag-js/core"
import { isFunction } from "@zag-js/utils"
import { parts } from "./hover-card.anatomy"

// ID generators — only for parts referenced by ARIA attributes
export const getTriggerId = (scope: Scope, value?: string) => {
  const customId = scope.ids?.trigger
  if (customId != null) return isFunction(customId) ? customId(value) : customId
  return value ? `${scope.id}:trigger:${value}` : `${scope.id}:trigger`
}
export const getContentId = (scope: Scope, value?: string | null) => {
  const id = scope.ids?.content ?? `${scope.id}:content`
  return value != null ? `${id}:${value}` : id
}
export const getPositionerId = (scope: Scope) => scope.ids?.positioner ?? `${scope.id}:positioner`
export const getArrowId = (scope: Scope) => scope.ids?.arrow ?? `${scope.id}:arrow`

// Element lookups — use querySelector with merged data attributes
export const getContentEl = (scope: Scope, value?: string | null) => {
  const selector = scope.selector(parts.content)
  if (value == null) return scope.query(selector)
  return scope.query(`${selector}[data-value="${value}"]`) ?? scope.query(`${selector}:not([data-value])`)
}
export const getViewportEl = (scope: Scope) => scope.query(scope.selector(parts.viewport))
export const getLayerEl = (scope: Scope, value?: string | null) => getViewportEl(scope) ?? getContentEl(scope, value)
export const getPositionerEl = (scope: Scope) => scope.query(scope.selector(parts.positioner))
export const getArrowEl = (scope: Scope) => scope.query(scope.selector(parts.arrow))

export const getTriggerEls = (scope: Scope): HTMLElement[] => scope.queryAll<HTMLElement>(scope.selector(parts.trigger))

export const getTriggerEl = (scope: Scope, value?: string | null): HTMLElement | null => {
  if (value == null) return getTriggerEls(scope)[0] ?? null
  return scope.query(`${scope.selector(parts.trigger)}[data-value="${value}"]`)
}
