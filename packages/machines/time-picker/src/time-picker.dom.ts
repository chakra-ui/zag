import { query, queryAll } from "@zag-js/dom-query"
import type { TimeUnit } from "./time-picker.types"
import type { Scope } from "@zag-js/core"

export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `time-picker:${ctx.id}:content`
export const getColumnId = (ctx: Scope, unit: TimeUnit) =>
  ctx.ids?.column?.(unit) ?? `time-picker:${ctx.id}:column:${unit}`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `time-picker:${ctx.id}:control`
export const getClearTriggerId = (ctx: Scope) => ctx.ids?.clearTrigger ?? `time-picker:${ctx.id}:clear-trigger`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `time-picker:${ctx.id}:positioner`
export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `time-picker:${ctx.id}:input`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `time-picker:${ctx.id}:trigger`

export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getColumnEl = (ctx: Scope, unit: TimeUnit) =>
  query(getContentEl(ctx), `[data-part=column][data-unit=${unit}]`)
export const getColumnEls = (ctx: Scope) => queryAll(getContentEl(ctx), `[data-part=column]:not([hidden])`)
export const getColumnCellEls = (ctx: Scope, unit: TimeUnit) => queryAll(getColumnEl(ctx, unit), `[data-part=cell]`)

export const getControlEl = (ctx: Scope) => ctx.getById(getControlId(ctx))
export const getClearTriggerEl = (ctx: Scope) => ctx.getById(getClearTriggerId(ctx))
export const getPositionerEl = (ctx: Scope) => ctx.getById(getPositionerId(ctx))
export const getInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getInputId(ctx))
export const getTriggerEl = (ctx: Scope) => ctx.getById(getTriggerId(ctx))

export const getFocusedCell = (ctx: Scope) => query(getContentEl(ctx), `[data-part=cell][data-focus]`)
export const getInitialFocusCell = (ctx: Scope, unit: TimeUnit): HTMLElement | null => {
  const contentEl = getContentEl(ctx)
  let cellEl = query(contentEl, `[data-part=cell][data-unit=${unit}][aria-current]`)
  cellEl ||= query(contentEl, `[data-part=cell][data-unit=${unit}][data-now]`)
  cellEl ||= query(contentEl, `[data-part=cell][data-unit=${unit}]`)
  return cellEl
}

export const getColumnUnit = (el: HTMLElement): TimeUnit => el.dataset.unit as TimeUnit
export const getCellValue = (el: HTMLElement | null): any => {
  const value = el?.dataset.value
  return el?.dataset.unit === "period" ? value : Number(value ?? "0")
}
