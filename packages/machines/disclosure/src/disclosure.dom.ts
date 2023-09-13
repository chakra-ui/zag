import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./disclosure.types"

export const dom = createScope({
  getButtonId: (ctx: Ctx) => ctx.ids?.button ?? `disclosure:${ctx.id}:button`,
  getDisclosureId: (ctx: Ctx) => ctx.ids?.disclosure ?? `disclosure:${ctx.id}:disclosure`,
})
