import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getListId = (ctx: Scope) => ctx.ids?.list ?? `${ctx.id}:list`
export const getTriggerId = (ctx: Scope, value: string) => ctx.ids?.triggerId?.(value) ?? `${ctx.id}:trigger:${value}`
export const getContentId = (ctx: Scope, value: string) => ctx.ids?.contentId?.(value) ?? `${ctx.id}:content:${value}`
