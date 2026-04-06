import { query, queryAll } from "@zag-js/dom-query"
import type { DateView } from "./date-picker.types"
import type { Scope } from "@zag-js/core"
import { parts } from "./date-picker.anatomy"

export const getLabelId = (ctx: Scope, index: number) => ctx.ids?.label?.(index) ?? `${ctx.id}:label:${index}`
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getTableId = (ctx: Scope, id: string) => ctx.ids?.table?.(id) ?? `${ctx.id}:table:${id}`
export const getTableHeaderId = (ctx: Scope, id: string) => ctx.ids?.tableHeader?.(id) ?? `${ctx.id}:thead`
export const getTableBodyId = (ctx: Scope, id: string) => ctx.ids?.tableBody?.(id) ?? `${ctx.id}:tbody`
export const getTableRowId = (ctx: Scope, id: string) => ctx.ids?.tableRow?.(id) ?? `${ctx.id}:tr:${id}`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`
export const getCellTriggerId = (ctx: Scope, id: string) => ctx.ids?.cellTrigger?.(id) ?? `${ctx.id}:cell-trigger:${id}`
export const getPrevTriggerId = (ctx: Scope, view: DateView) => ctx.ids?.prevTrigger?.(view) ?? `${ctx.id}:prev:${view}`
export const getNextTriggerId = (ctx: Scope, view: DateView) => ctx.ids?.nextTrigger?.(view) ?? `${ctx.id}:next:${view}`
export const getViewTriggerId = (ctx: Scope, view: DateView) => ctx.ids?.viewTrigger?.(view) ?? `${ctx.id}:view:${view}`
export const getClearTriggerId = (ctx: Scope) => ctx.ids?.clearTrigger ?? `${ctx.id}:clear`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getInputId = (ctx: Scope, index: number) => ctx.ids?.input?.(index) ?? `${ctx.id}:input:${index}`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `${ctx.id}:trigger`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `${ctx.id}:positioner`
export const getMonthSelectId = (ctx: Scope) => ctx.ids?.monthSelect ?? `${ctx.id}:month-select`
export const getYearSelectId = (ctx: Scope) => ctx.ids?.yearSelect ?? `${ctx.id}:year-select`

export const getFocusedCell = (ctx: Scope, view: DateView) =>
  query(getContentEl(ctx), `[${parts.tableCellTrigger.attr}][data-view=${view}][data-focus]:not([data-outside-range])`)
export const getTriggerEl = (ctx: Scope) => ctx.query<HTMLButtonElement>(ctx.selector(parts.trigger))
export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))
export const getInputEls = (ctx: Scope) => queryAll<HTMLInputElement>(getControlEl(ctx), `[${parts.input.attr}]`)
export const getYearSelectEl = (ctx: Scope) => ctx.query<HTMLSelectElement>(ctx.selector(parts.yearSelect))
export const getMonthSelectEl = (ctx: Scope) => ctx.query<HTMLSelectElement>(ctx.selector(parts.monthSelect))
export const getClearTriggerEl = (ctx: Scope) => ctx.query<HTMLButtonElement>(ctx.selector(parts.clearTrigger))
export const getPositionerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.positioner))
export const getControlEl = (ctx: Scope) => ctx.query(ctx.selector(parts.control))
