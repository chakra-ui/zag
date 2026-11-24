import type { Scope } from "@zag-js/core"
import { parts } from "./image-cropper.anatomy"
import type { ImageCropperService } from "./image-cropper.types"
import type { CropExportParams } from "./utils/transform"

// ID generators — only for parts referenced by ARIA attributes
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getViewportId = (ctx: Scope) => ctx.ids?.viewport ?? `${ctx.id}:viewport`
export const getImageId = (ctx: Scope) => ctx.ids?.image ?? `${ctx.id}:image`
export const getSelectionId = (ctx: Scope) => ctx.ids?.selection ?? `${ctx.id}:selection`
export const getHandleId = (ctx: Scope, position: string) =>
  ctx.ids?.handle?.(position) ?? `${ctx.id}:handle:${position}`

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getViewportEl = (ctx: Scope) => ctx.query(ctx.selector(parts.viewport))
export const getImageEl = (ctx: Scope) => ctx.query<HTMLImageElement>(ctx.selector(parts.image))
export const getSelectionEl = (ctx: Scope) => ctx.query(ctx.selector(parts.selection))
export const getHandleEl = (ctx: Scope, position: string) =>
  ctx.query(`${ctx.selector(parts.handle)}[data-placement="${position}"]`)

function getImageRect(scope: Scope) {
  const imageEl = getImageEl(scope)
  const viewportEl = getViewportEl(scope)
  if (!imageEl || !viewportEl) return null

  let x = 0
  let y = 0
  let current: HTMLElement | null = imageEl

  while (current && current !== viewportEl) {
    x += current.offsetLeft
    y += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }

  if (current !== viewportEl) return null

  return {
    x,
    y,
    width: imageEl.offsetWidth,
    height: imageEl.offsetHeight,
  }
}

export function getCropExportParams(params: ImageCropperService): CropExportParams {
  const { context, scope } = params
  const viewportRect = context.get("viewportRect")
  const naturalSize = context.get("naturalSize")
  const measuredRect = getImageRect(scope)
  const imageRect =
    measuredRect && measuredRect.width > 0 && measuredRect.height > 0
      ? measuredRect
      : {
          x: 0,
          y: 0,
          width: viewportRect.width || naturalSize.width || 1,
          height: viewportRect.height || naturalSize.height || 1,
        }

  return {
    crop: context.get("crop"),
    zoom: context.get("zoom"),
    offset: context.get("offset"),
    rotation: context.get("rotation"),
    flip: context.get("flip"),
    imageRect,
    naturalSize,
  }
}
