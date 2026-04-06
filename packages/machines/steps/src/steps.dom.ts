import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getListId = (ctx: Scope) => ctx.ids?.list ?? `${ctx.id}:list`
export const getTriggerId = (ctx: Scope, index: number) => ctx.ids?.triggerId?.(index) ?? `${ctx.id}:trigger:${index}`
export const getContentId = (ctx: Scope, index: number) => ctx.ids?.contentId?.(index) ?? `${ctx.id}:content:${index}`
