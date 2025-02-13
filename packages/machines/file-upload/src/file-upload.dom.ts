import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `file:${ctx.id}`
export const getDropzoneId = (ctx: Scope) => ctx.ids?.dropzone ?? `file:${ctx.id}:dropzone`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `file:${ctx.id}:input`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `file:${ctx.id}:trigger`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `file:${ctx.id}:label`
export const getItemId = (ctx: Scope, id: string) => ctx.ids?.item?.(id) ?? `file:${ctx.id}:item:${id}`
export const getItemNameId = (ctx: Scope, id: string) => ctx.ids?.itemName?.(id) ?? `file:${ctx.id}:item-name:${id}`
export const getItemSizeTextId = (ctx: Scope, id: string) =>
  ctx.ids?.itemSizeText?.(id) ?? `file:${ctx.id}:item-size:${id}`
export const getItemPreviewId = (ctx: Scope, id: string) =>
  ctx.ids?.itemPreview?.(id) ?? `file:${ctx.id}:item-preview:${id}`

export const getRootEl = (ctx: Scope) => ctx.getById<HTMLElement>(getRootId(ctx))
export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))
export const getDropzoneEl = (ctx: Scope) => ctx.getById<HTMLElement>(getDropzoneId(ctx))
