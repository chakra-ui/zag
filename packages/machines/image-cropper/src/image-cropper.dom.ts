import type { Scope } from "@zag-js/core"
import { parts } from "./image-cropper.anatomy"
import type { ImageCropperService } from "./image-cropper.types"

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
  ctx.query(`${ctx.selector(parts.handle)}[data-value="${position}"]`)

export function drawCroppedImageToCanvas(params: ImageCropperService): HTMLCanvasElement | null {
  const { context, scope } = params

  const imageEl = getImageEl(scope)
  if (!imageEl || !imageEl.complete) return null

  const doc = imageEl.ownerDocument

  const crop = context.get("crop")
  const zoom = context.get("zoom")
  const rotation = context.get("rotation")
  const flip = context.get("flip")
  const viewportRect = context.get("viewportRect")
  const naturalSize = context.get("naturalSize")
  const offset = context.get("offset")

  const canvas = doc.createElement("canvas")
  canvas.width = crop.width
  canvas.height = crop.height

  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  ctx.save()

  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)

  const scaleX = flip.horizontal ? -1 : 1
  const scaleY = flip.vertical ? -1 : 1
  ctx.scale(scaleX, scaleY)

  const viewportCenterX = viewportRect.width / 2
  const viewportCenterY = viewportRect.height / 2

  const cropCenterX = crop.x + crop.width / 2
  const cropCenterY = crop.y + crop.height / 2

  const deltaX = cropCenterX - viewportCenterX
  const deltaY = cropCenterY - viewportCenterY

  const imageCenterX = naturalSize.width / 2
  const imageCenterY = naturalSize.height / 2

  const sourceX = imageCenterX + (deltaX - offset.x) / zoom
  const sourceY = imageCenterY + (deltaY - offset.y) / zoom
  const sourceWidth = crop.width / zoom
  const sourceHeight = crop.height / zoom

  ctx.drawImage(
    imageEl,
    sourceX - sourceWidth / 2,
    sourceY - sourceHeight / 2,
    sourceWidth,
    sourceHeight,
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height,
  )

  ctx.restore()

  return canvas
}
