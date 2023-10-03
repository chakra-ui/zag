import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./pagination.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `pagination:${ctx.id}`,
  getPrevTriggerId: (ctx: Ctx) => ctx.ids?.prevTrigger ?? `pagination:${ctx.id}:prev`,
  getNextTriggerId: (ctx: Ctx) => ctx.ids?.nextTrigger ?? `pagination:${ctx.id}:next`,
  getEllipsisId: (ctx: Ctx, index: number) => ctx.ids?.ellipsis?.(index) ?? `pagination:${ctx.id}:ellipsis:${index}`,
  getItemId: (ctx: Ctx, page: number) => ctx.ids?.item?.(page) ?? `pagination:${ctx.id}:item:${page}`,
})
