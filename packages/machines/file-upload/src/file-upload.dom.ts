import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./file-upload.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => `file:${ctx.id}`,
  getDropzoneId: (ctx: Ctx) => `file:${ctx.id}:dropzone`,
  getHiddenInputId: (ctx: Ctx) => `file:${ctx.id}:input`,
  getTriggerId: (ctx: Ctx) => `file:${ctx.id}:trigger`,
  getLabelId: (ctx: Ctx) => `file:${ctx.id}:label`,
  getItemId: (ctx: Ctx, size: string) => `file:${ctx.id}:item:${size}`,
  getItemNameId: (ctx: Ctx, size: string) => `file:${ctx.id}:item-name:${size}`,
  getItemSizeTextId: (ctx: Ctx, size: string) => `file:${ctx.id}:item-size:${size}`,
  getItemPreviewId: (ctx: Ctx, size: string) => `file:${ctx.id}:item-preview:${size}`,
  getHiddenInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getHiddenInputId(ctx)),
  getDropzoneEl: (ctx: Ctx) => dom.getById(ctx, dom.getDropzoneId(ctx)),
})
