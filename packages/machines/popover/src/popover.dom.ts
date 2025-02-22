import type { Scope } from "@zag-js/core"
import { getFocusables } from "@zag-js/dom-query"

export const getAnchorId = (scope: Scope) => scope.ids?.anchor ?? `popover:${scope.id}:anchor`
export const getTriggerId = (scope: Scope) => scope.ids?.trigger ?? `popover:${scope.id}:trigger`
export const getContentId = (scope: Scope) => scope.ids?.content ?? `popover:${scope.id}:content`
export const getPositionerId = (scope: Scope) => scope.ids?.positioner ?? `popover:${scope.id}:popper`
export const getArrowId = (scope: Scope) => scope.ids?.arrow ?? `popover:${scope.id}:arrow`
export const getTitleId = (scope: Scope) => scope.ids?.title ?? `popover:${scope.id}:title`
export const getDescriptionId = (scope: Scope) => scope.ids?.description ?? `popover:${scope.id}:desc`
export const getCloseTriggerId = (scope: Scope) => scope.ids?.closeTrigger ?? `popover:${scope.id}:close`

export const getAnchorEl = (scope: Scope) => scope.getById(getAnchorId(scope))
export const getTriggerEl = (scope: Scope) => scope.getById(getTriggerId(scope))
export const getContentEl = (scope: Scope) => scope.getById(getContentId(scope))
export const getPositionerEl = (scope: Scope) => scope.getById(getPositionerId(scope))
export const getTitleEl = (scope: Scope) => scope.getById(getTitleId(scope))
export const getDescriptionEl = (scope: Scope) => scope.getById(getDescriptionId(scope))

export const getFocusableEls = (scope: Scope) => getFocusables(getContentEl(scope))
export const getFirstFocusableEl = (scope: Scope) => getFocusableEls(scope)[0]
