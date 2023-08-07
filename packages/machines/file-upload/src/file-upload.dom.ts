import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./file-upload.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => `fileupload:${ctx.id}`,
  getDropzoneId: (ctx: Ctx) => `fileupload:${ctx.id}:dropzone`,
  getHiddenInputId: (ctx: Ctx) => `fileupload:${ctx.id}:input`,
  getTriggerId: (ctx: Ctx) => `fileupload:${ctx.id}:trigger`,
  getLabelId: (ctx: Ctx) => `fileupload:${ctx.id}:label`,
  getHiddenInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getHiddenInputId(ctx)),
})
