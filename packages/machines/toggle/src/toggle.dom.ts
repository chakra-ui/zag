import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./toggle.types"

export const dom = createScope({
  getButtonId: (ctx: Ctx) => ctx.ids?.button ?? `toggle:${ctx.id}:button`,
})
