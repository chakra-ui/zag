import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./file-upload.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => `fileupload:${ctx.id}`,
  getInputId: (ctx: Ctx) => `fileupload:${ctx.id}:input`,
  getTriggerId: (ctx: Ctx) => `fileupload:${ctx.id}:trigger`,
  getInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getInputId(ctx)),
  canUseFs: (ctx: Ctx) => {
    const win = dom.getWin(ctx)
    return typeof win !== "undefined" && win.isSecureContext && "showOpenFilePicker" in win
  },
})
