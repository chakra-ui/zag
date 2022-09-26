import { defineDomHelpers } from "@zag-js/dom-utils"
import type { MachineContext as Ctx } from "./pagination.types"

export const dom = defineDomHelpers({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `pagination:${ctx.id}`,
  getPrevButtonId: (ctx: Ctx) => ctx.ids?.prevButton ?? `pagination:${ctx.id}:prev-button`,
  getNextButtonId: (ctx: Ctx) => ctx.ids?.nextButton ?? `pagination:${ctx.id}:next-button`,

  getDotId: (ctx: Ctx, index: number) => ctx.ids?.dot?.(index) ?? `pagination:${ctx.id}:dot:${index}`,
  getPageId: (ctx: Ctx, page: number) => ctx.ids?.page?.(page) ?? `pagination:${ctx.id}:page:${page}`,
})
