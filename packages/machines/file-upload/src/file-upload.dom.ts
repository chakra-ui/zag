import { hash } from "@zag-js/utils"
import type { Scope } from "@zag-js/core"
import { parts } from "./file-upload.anatomy"

// ID generators — only for parts referenced by ARIA attributes
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getDropzoneId = (ctx: Scope) => ctx.ids?.dropzone ?? `${ctx.id}:dropzone`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `${ctx.id}:input`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `${ctx.id}:trigger`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getItemId = (ctx: Scope, id: string) => ctx.ids?.item?.(id) ?? `${ctx.id}:item:${id}`
export const getItemNameId = (ctx: Scope, id: string) => ctx.ids?.itemName?.(id) ?? `${ctx.id}:item-name:${id}`
export const getItemSizeTextId = (ctx: Scope, id: string) => ctx.ids?.itemSizeText?.(id) ?? `${ctx.id}:item-size:${id}`
export const getItemPreviewId = (ctx: Scope, id: string) => ctx.ids?.itemPreview?.(id) ?? `${ctx.id}:item-preview:${id}`
export const getItemDeleteTriggerId = (ctx: Scope, id: string) =>
  ctx.ids?.itemDeleteTrigger?.(id) ?? `${ctx.id}:item-delete:${id}`

export const getFileId = (file: File) => hash(`${file.name}-${file.size}`)

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query<HTMLElement>(ctx.selector(parts.root))
export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))
export const getDropzoneEl = (ctx: Scope) => ctx.query<HTMLElement>(ctx.selector(parts.dropzone))
