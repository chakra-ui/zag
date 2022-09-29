import { defineDomHelpers } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./pagination.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `pagination:${ctx.id}`,
  getPrevItemId: (ctx: Ctx) => ctx.ids?.prevItem ?? `pagination:${ctx.id}:prev-item`,
  getNextItemId: (ctx: Ctx) => ctx.ids?.nextItem ?? `pagination:${ctx.id}:next-item`,

  getEllipsisId: (ctx: Ctx, index: number) => ctx.ids?.ellipsis?.(index) ?? `pagination:${ctx.id}:ellipsis:${index}`,
  getItemId: (ctx: Ctx, page: number) => ctx.ids?.item?.(page) ?? `pagination:${ctx.id}:item:${page}`,
})
