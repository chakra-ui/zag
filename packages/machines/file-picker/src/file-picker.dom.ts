import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./file-picker.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => `filePicker:${ctx.id}`,
  getDropzoneId: (ctx: Ctx) => `filePicker:${ctx.id}:dropzone`,
  getHiddenInputId: (ctx: Ctx) => `filePicker:${ctx.id}:input`,
  getTriggerId: (ctx: Ctx) => `filePicker:${ctx.id}:trigger`,
  getLabelId: (ctx: Ctx) => `filePicker:${ctx.id}:label`,
  getHiddenInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getHiddenInputId(ctx)),
})
