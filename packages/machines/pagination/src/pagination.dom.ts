import { defineDomHelpers } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./pagination.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `pagination:${ctx.id}`,
  getPrevButtonId: (ctx: Ctx) => ctx.ids?.prevButton ?? `pagination:${ctx.id}:prev-button`,
  getNextButtonId: (ctx: Ctx) => ctx.ids?.nextButton ?? `pagination:${ctx.id}:next-button`,

  getEllipsisId: (ctx: Ctx, index: number) => ctx.ids?.ellipsis?.(index) ?? `pagination:${ctx.id}:ellipsis:${index}`,
  getItemId: (ctx: Ctx, page: number) => ctx.ids?.item?.(page) ?? `pagination:${ctx.id}:item:${page}`,
})
