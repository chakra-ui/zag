import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./steps.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `steps:${ctx.id}`,
  getListId: (ctx: Ctx) => ctx.ids?.list ?? `steps:${ctx.id}:list`,
  getTriggerId: (ctx: Ctx, index: number) => ctx.ids?.triggerId?.(index) ?? `steps:${ctx.id}:trigger:${index}`,
  getContentId: (ctx: Ctx, index: number) => ctx.ids?.contentId?.(index) ?? `steps:${ctx.id}:content:${index}`,
})
