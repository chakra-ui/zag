import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./timer.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `timer:${ctx.id}:root`,
  getAreaId: (ctx: Ctx) => ctx.ids?.area ?? `timer:${ctx.id}:area`,
  getAreaEl: (ctx: Ctx) => dom.getById(ctx, dom.getAreaId(ctx)),
})
