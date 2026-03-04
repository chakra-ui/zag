import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `pagination:${ctx.id}`
export const getFirstTriggerId = (ctx: Scope) => ctx.ids?.firstTrigger ?? `pagination:${ctx.id}:first`
export const getPrevTriggerId = (ctx: Scope) => ctx.ids?.prevTrigger ?? `pagination:${ctx.id}:prev`
export const getNextTriggerId = (ctx: Scope) => ctx.ids?.nextTrigger ?? `pagination:${ctx.id}:next`
export const getLastTriggerId = (ctx: Scope) => ctx.ids?.lastTrigger ?? `pagination:${ctx.id}:last`
export const getEllipsisId = (ctx: Scope, index: number) =>
  ctx.ids?.ellipsis?.(index) ?? `pagination:${ctx.id}:ellipsis:${index}`
export const getItemId = (ctx: Scope, page: number) => ctx.ids?.item?.(page) ?? `pagination:${ctx.id}:item:${page}`
