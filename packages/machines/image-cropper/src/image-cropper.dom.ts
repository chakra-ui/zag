import type { Scope } from "@zag-js/core"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `image-cropper:${ctx.id}`
export const getViewportId = (ctx: Scope) => ctx.ids?.viewport ?? `image-cropper:${ctx.id}:viewport`
export const getImageId = (ctx: Scope) => ctx.ids?.image ?? `image-cropper:${ctx.id}:image`
export const getSelectionId = (ctx: Scope) => ctx.ids?.selection ?? `image-cropper:${ctx.id}:selection`
export const getHandleId = (ctx: Scope, position: string) =>
  ctx.ids?.handle?.(position) ?? `image-cropper:${ctx.id}:handle:${position}`

export const getRootEl = (ctx: Scope) => ctx.getById(getRootId(ctx))
export const getViewportEl = (ctx: Scope) => ctx.getById(getViewportId(ctx))
export const getImageEl = (ctx: Scope) => ctx.getById<HTMLImageElement>(getImageId(ctx))
export const getSelectionEl = (ctx: Scope) => ctx.getById(getSelectionId(ctx))
export const getHandleEl = (ctx: Scope, position: string) => ctx.getById(getHandleId(ctx, position))
