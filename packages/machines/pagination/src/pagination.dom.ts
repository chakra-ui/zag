import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getFirstTriggerId = (ctx: Scope) => ctx.ids?.firstTrigger ?? `${ctx.id}:first`
export const getPreviousTriggerId = (ctx: Scope) => ctx.ids?.previousTrigger ?? `${ctx.id}:previous`
export const getNextTriggerId = (ctx: Scope) => ctx.ids?.nextTrigger ?? `${ctx.id}:next`
export const getLastTriggerId = (ctx: Scope) => ctx.ids?.lastTrigger ?? `${ctx.id}:last`
export const getEllipsisId = (ctx: Scope, index: number) => ctx.ids?.ellipsis?.(index) ?? `${ctx.id}:ellipsis:${index}`
export const getItemId = (ctx: Scope, page: number) => ctx.ids?.item?.(page) ?? `${ctx.id}:item:${page}`
