import type { Scope } from "@zag-js/core"
import type { GetCroppedImageOptions, ImageCropperService } from "./image-cropper.types"
import { applyCropExportTransform, type CropExportParams, getCropOutputSize } from "./utils/transform"

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

export function drawCroppedImageToCanvas(
  params: ImageCropperService,
  options: Pick<GetCroppedImageOptions, "maxSize"> = {},
): HTMLCanvasElement | null {
  const imageEl = getImageEl(params.scope)
  if (!imageEl || !imageEl.complete) return null

  const exportParams = getCropExportParams(params)
  const outputSize = getCropOutputSize(exportParams, options.maxSize)

  try {
    const canvas = imageEl.ownerDocument.createElement("canvas")
    canvas.width = outputSize.width
    canvas.height = outputSize.height
    if (canvas.width !== outputSize.width || canvas.height !== outputSize.height) return null

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    applyCropExportTransform(ctx, exportParams, outputSize)
    ctx.drawImage(imageEl, 0, 0)
    return canvas
  } catch {
    return null
  }
}
