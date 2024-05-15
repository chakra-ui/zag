import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./progress.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `progress-${ctx.id}`,
  getTrackId: (ctx: Ctx) => ctx.ids?.track ?? `progress-${ctx.id}-track`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `progress-${ctx.id}-label`,
  getCircleId: (ctx: Ctx) => ctx.ids?.circle ?? `progress-${ctx.id}-circle`,
})
