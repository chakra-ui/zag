import type { Scope } from "@zag-js/core"

/* ID generators ---------------------------------------------------------------- */

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `scheduler:${ctx.id}`
export const getGridId = (ctx: Scope) => ctx.ids?.grid ?? `scheduler:${ctx.id}:grid`
export const getGridRowId = (ctx: Scope) => ctx.ids?.gridRow ?? `scheduler:${ctx.id}:grid-row`
export const getColumnHeadersId = (ctx: Scope) => ctx.ids?.columnHeaders ?? `scheduler:${ctx.id}:column-headers`
export const getAllDayRowId = (ctx: Scope) => ctx.ids?.allDayRow ?? `scheduler:${ctx.id}:all-day-row`
export const getEventId = (ctx: Scope, eventId: string) =>
  ctx.ids?.event?.(eventId) ?? `scheduler:${ctx.id}:event:${eventId}`
export const getTimeSlotId = (ctx: Scope, key: string) => ctx.ids?.timeSlot?.(key) ?? `scheduler:${ctx.id}:slot:${key}`
export const getDayColumnId = (ctx: Scope, key: string) => ctx.ids?.dayColumn?.(key) ?? `scheduler:${ctx.id}:day:${key}`
export const getDayCellId = (ctx: Scope, key: string) => ctx.ids?.dayCell?.(key) ?? `scheduler:${ctx.id}:cell:${key}`

/* Element getters -------------------------------------------------------------- */

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getGridEl = (ctx: Scope) => ctx.getById(getGridId(ctx))
export const getEventEl = (ctx: Scope, eventId: string) => ctx.getById(getEventId(ctx, eventId))

export const getFocusedDayCellTriggerEl = (ctx: Scope) => {
  const base = `[data-scheduler-day-cell-trigger="${ctx.id}"][data-focus]`
  // A date can appear in two mini-grids (Mar 31 is in-month in March, outside in April), so
  // prefer the in-month one.
  return ctx.query<HTMLElement>(`${base}[data-in-month]`) ?? ctx.query<HTMLElement>(base)
}

/** The grid includes the time gutter, so the first day column gives the true content origin. */
export const getContentRect = (ctx: Scope) => {
  const gridEl = getGridEl(ctx)
  if (!gridEl) return null
  const gridRect = gridEl.getBoundingClientRect()
  const colRect = gridEl.querySelector<HTMLElement>("[data-scheduler-day-column]")?.getBoundingClientRect()
  if (!colRect) return gridRect
  return { left: colRect.left, top: colRect.top, width: gridRect.right - colRect.left, height: colRect.height }
}

export const getAllDayRowEl = (ctx: Scope) => ctx.query<HTMLElement>(`[data-scheduler-all-day-row="${ctx.id}"]`)

/** Which region a drag is over. Absent all-day row means every point is a time-grid point. */
export const isPointInAllDayRow = (ctx: Scope, point: { y: number }) => {
  const rect = getAllDayRowEl(ctx)?.getBoundingClientRect()
  if (!rect) return false
  return point.y >= rect.top && point.y <= rect.bottom
}

/**
 * The date of the all-day cell under a point, hit-tested rather than derived from the grid's
 * geometry — a scrollbar on the time grid leaves the two column tracks slightly out of step.
 * Null when the point isn't over the row.
 */
export const getAllDayCellDateAt = (ctx: Scope, point: { x: number; y: number }) => {
  const row = getAllDayRowEl(ctx)
  if (!row || !isPointInAllDayRow(ctx, point)) return null
  const cells = Array.from(row.querySelectorAll<HTMLElement>(`[data-scheduler-day-cell="${ctx.id}"]`))
  if (!cells.length) return null
  const hit =
    cells.find((cell) => {
      const rect = cell.getBoundingClientRect()
      return point.x >= rect.left && point.x < rect.right
    }) ??
    // past either edge, clamp to the nearest end so the drag still tracks
    (point.x < cells[0]!.getBoundingClientRect().left ? cells[0]! : cells[cells.length - 1]!)
  return hit.getAttribute("data-date")
}
