import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./pagination.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `pagination:${ctx.id}`,
  getPrevPageTriggerId: (ctx: Ctx) => ctx.ids?.prevPageTrigger ?? `pagination:${ctx.id}:prev`,
  getNextPageTriggerId: (ctx: Ctx) => ctx.ids?.nextPageTrigger ?? `pagination:${ctx.id}:next`,
  getEllipsisId: (ctx: Ctx, index: number) => ctx.ids?.ellipsis?.(index) ?? `pagination:${ctx.id}:ellipsis:${index}`,
  getPageTriggerId: (ctx: Ctx, page: number) => ctx.ids?.pageTrigger?.(page) ?? `pagination:${ctx.id}:item:${page}`,
})
