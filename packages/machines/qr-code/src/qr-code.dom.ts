import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./qr-code.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `qrcode:${ctx.id}:root`,
  getFrameId: (ctx: Ctx) => ctx.ids?.svg ?? `qrcode:${ctx.id}:svg`,
  getFrameEl: (ctx: Ctx) => dom.getById<SVGElement>(ctx, dom.getFrameId(ctx)),
})
