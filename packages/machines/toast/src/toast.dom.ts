import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx, Placement } from "./toast.types"

export const dom = createScope({
  getGroupId: (placement: Placement) => `toast-group:${placement}`,
  getRootId: (ctx: Ctx) => `toast:${ctx.id}`,
  getTitleId: (ctx: Ctx) => `toast:${ctx.id}:title`,
  getDescriptionId: (ctx: Ctx) => `toast:${ctx.id}:description`,
  getCloseTriggerId: (ctx: Ctx) => `toast${ctx.id}:close`,
})
