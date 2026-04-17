import type { Scope } from "@zag-js/core"

/* ID generators ---------------------------------------------------------------- */

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `scheduler:${ctx.id}`
export const getGridId = (ctx: Scope) => ctx.ids?.grid ?? `scheduler:${ctx.id}:grid`
export const getEventId = (ctx: Scope, eventId: string) =>
  ctx.ids?.event?.(eventId) ?? `scheduler:${ctx.id}:event:${eventId}`
export const getTimeSlotId = (ctx: Scope, key: string) => ctx.ids?.timeSlot?.(key) ?? `scheduler:${ctx.id}:slot:${key}`
export const getDayColumnId = (ctx: Scope, key: string) => ctx.ids?.dayColumn?.(key) ?? `scheduler:${ctx.id}:day:${key}`
export const getDayCellId = (ctx: Scope, key: string) => ctx.ids?.dayCell?.(key) ?? `scheduler:${ctx.id}:cell:${key}`

/* Element getters -------------------------------------------------------------- */

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getGridEl = (ctx: Scope) => ctx.getById(getGridId(ctx))
export const getEventEl = (ctx: Scope, eventId: string) => ctx.getById(getEventId(ctx, eventId))
