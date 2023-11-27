import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./file-upload.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `file:${ctx.id}`,
  getDropzoneId: (ctx: Ctx) => ctx.ids?.dropzone ?? `file:${ctx.id}:dropzone`,
  getHiddenInputId: (ctx: Ctx) => ctx.ids?.hiddenInput ?? `file:${ctx.id}:input`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `file:${ctx.id}:trigger`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `file:${ctx.id}:label`,
  getItemId: (ctx: Ctx, id: string) => ctx.ids?.item?.(id) ?? `file:${ctx.id}:item:${id}`,
  getItemNameId: (ctx: Ctx, id: string) => ctx.ids?.itemName?.(id) ?? `file:${ctx.id}:item-name:${id}`,
  getItemSizeTextId: (ctx: Ctx, id: string) => ctx.ids?.itemSizeText?.(id) ?? `file:${ctx.id}:item-size:${id}`,
  getItemPreviewId: (ctx: Ctx, id: string) => ctx.ids?.itemPreview?.(id) ?? `file:${ctx.id}:item-preview:${id}`,

  getHiddenInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getHiddenInputId(ctx)),
  getDropzoneEl: (ctx: Ctx) => dom.getById(ctx, dom.getDropzoneId(ctx)),
})
