import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./timer.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `timer:${ctx.id}`,
  getSegmentId: (ctx: Ctx, id: string | number) => ctx.ids?.segment?.(id) ?? `timer:${ctx.id}:segment:${id}`,
  getSeparatorId: (ctx: Ctx) => ctx.ids?.separator ?? `timer:${ctx.id}:label`,
})
