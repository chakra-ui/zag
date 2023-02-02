import { defineDomHelpers } from "@zag-js/dom-utils"
import type { GroupMachineContext as GroupCtx, MachineContext as Ctx, Placement } from "./toast.types"

export const dom = defineDomHelpers({
  getGroupId: (placement: Placement) => `toast-group:${placement}`,
  getRootId: (ctx: Ctx) => `toast:${ctx.id}`,
  getTitleId: (ctx: Ctx) => `toast:${ctx.id}:title`,
  getDescriptionId: (ctx: Ctx) => `toast:${ctx.id}:description`,
  getCloseTriggerId: (ctx: Ctx) => `toast${ctx.id}:close`,
  getPortalId: (ctx: GroupCtx) => `toast-portal:${ctx.id}`,
})
