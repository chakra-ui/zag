import { createScope } from "@zag-js/dom-query"
import type { MachineContext } from "./qr-code.types"

export const dom = createScope({
  getRootId: (ctx: MachineContext) => ctx.ids?.root ?? `qrcode:${ctx.id}:root`,
})
