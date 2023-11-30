import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./progress.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => `progress-${ctx.id}`,
  getTrackId: (ctx: Ctx) => `progress-${ctx.id}-track`,
  getLabelId: (ctx: Ctx) => `progress-${ctx.id}-label`,
  getCircleId: (ctx: Ctx) => `progress-${ctx.id}-circle`,
})
