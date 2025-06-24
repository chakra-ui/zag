import type { Scope } from "@zag-js/core"

export const getTriggerId = (scope: Scope) => scope.ids?.trigger ?? `tooltip:${scope.id}:trigger`

export const getContentId = (scope: Scope) => scope.ids?.content ?? `tooltip:${scope.id}:content`

export const getArrowId = (scope: Scope) => scope.ids?.arrow ?? `tooltip:${scope.id}:arrow`

export const getPositionerId = (scope: Scope) => scope.ids?.positioner ?? `tooltip:${scope.id}:popper`

export const getTriggerEl = (scope: Scope) => scope.getById(getTriggerId(scope))

export const getContentEl = (scope: Scope) => scope.getById(getContentId(scope))

export const getPositionerEl = (scope: Scope) => scope.getById(getPositionerId(scope))

export const getArrowEl = (scope: Scope) => scope.getById(getArrowId(scope))
