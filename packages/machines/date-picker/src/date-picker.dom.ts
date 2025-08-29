import { query, queryAll } from "@zag-js/dom-query"
import type { DateView } from "./date-picker.types"
import type { Scope } from "@zag-js/core"

export const getLabelId = (ctx: Scope, index: number) =>
  ctx.ids?.label?.(index) ?? `datepicker:${ctx.id}:label:${index}`
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `datepicker:${ctx.id}`
export const getTableId = (ctx: Scope, id: string) => ctx.ids?.table?.(id) ?? `datepicker:${ctx.id}:table:${id}`
export const getTableHeaderId = (ctx: Scope, id: string) => ctx.ids?.tableHeader?.(id) ?? `datepicker:${ctx.id}:thead`
export const getTableBodyId = (ctx: Scope, id: string) => ctx.ids?.tableBody?.(id) ?? `datepicker:${ctx.id}:tbody`
export const getTableRowId = (ctx: Scope, id: string) => ctx.ids?.tableRow?.(id) ?? `datepicker:${ctx.id}:tr:${id}`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `datepicker:${ctx.id}:content`
export const getCellTriggerId = (ctx: Scope, id: string) =>
  ctx.ids?.cellTrigger?.(id) ?? `datepicker:${ctx.id}:cell-trigger:${id}`
export const getPrevTriggerId = (ctx: Scope, view: DateView) =>
  ctx.ids?.prevTrigger?.(view) ?? `datepicker:${ctx.id}:prev:${view}`
export const getNextTriggerId = (ctx: Scope, view: DateView) =>
  ctx.ids?.nextTrigger?.(view) ?? `datepicker:${ctx.id}:next:${view}`
export const getViewTriggerId = (ctx: Scope, view: DateView) =>
  ctx.ids?.viewTrigger?.(view) ?? `datepicker:${ctx.id}:view:${view}`
export const getClearTriggerId = (ctx: Scope) => ctx.ids?.clearTrigger ?? `datepicker:${ctx.id}:clear`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `datepicker:${ctx.id}:control`
export const getInputId = (ctx: Scope, index: number) =>
  ctx.ids?.input?.(index) ?? `datepicker:${ctx.id}:input:${index}`
export const getSegmentGroupId = (ctx: Scope, index: number) =>
  ctx.ids?.segmentGroup?.(index) ?? `datepicker:${ctx.id}:segment-group:${index}`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `datepicker:${ctx.id}:trigger`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `datepicker:${ctx.id}:positioner`
export const getMonthSelectId = (ctx: Scope) => ctx.ids?.monthSelect ?? `datepicker:${ctx.id}:month-select`
export const getYearSelectId = (ctx: Scope) => ctx.ids?.yearSelect ?? `datepicker:${ctx.id}:year-select`

export const getFocusedCell = (ctx: Scope, view: DateView) =>
  query(getContentEl(ctx), `[data-part=table-cell-trigger][data-view=${view}][data-focus]:not([data-outside-range])`)
export const getTriggerEl = (ctx: Scope) => ctx.getById<HTMLButtonElement>(getTriggerId(ctx))
export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getInputEls = (ctx: Scope) => queryAll<HTMLInputElement>(getControlEl(ctx), `[data-part=input]`)
export const getYearSelectEl = (ctx: Scope) => ctx.getById<HTMLSelectElement>(getYearSelectId(ctx))
export const getMonthSelectEl = (ctx: Scope) => ctx.getById<HTMLSelectElement>(getMonthSelectId(ctx))
export const getClearTriggerEl = (ctx: Scope) => ctx.getById<HTMLButtonElement>(getClearTriggerId(ctx))
export const getPositionerEl = (ctx: Scope) => ctx.getById(getPositionerId(ctx))
export const getControlEl = (ctx: Scope) => ctx.getById(getControlId(ctx))
