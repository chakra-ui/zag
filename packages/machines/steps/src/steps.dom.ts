import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `steps:${ctx.id}`
export const getListId = (ctx: Scope) => ctx.ids?.list ?? `steps:${ctx.id}:list`
export const getTriggerId = (ctx: Scope, index: number) =>
  ctx.ids?.triggerId?.(index) ?? `steps:${ctx.id}:trigger:${index}`
export const getContentId = (ctx: Scope, index: number) =>
  ctx.ids?.contentId?.(index) ?? `steps:${ctx.id}:content:${index}`
