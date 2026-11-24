import { canvasToBlob, createCanvas } from "./canvas"
import { loadImage, type ImageSource } from "./load-image"

/**
 * A region of an image in its own pixels, measured after the image is flipped and then rotated.
 */
export interface ImageCrop {
  x: number
  y: number
  width: number
  height: number
  /**
   * The clockwise rotation in degrees
   * @default 0
   */
  rotation?: number | undefined
  /**
   * Whether the image is mirrored left to right
   * @default false
   */
  flipX?: boolean | undefined
  /**
   * Whether the image is mirrored top to bottom
   * @default false
   */
  flipY?: boolean | undefined
}

export interface CropImageOptions {
  /**
   * The image type to encode
   * @default "image/png"
   */
  type?: string | undefined
  /**
   * The quality from 0 to 1, for lossy types like JPEG and WebP
   */
  quality?: number | undefined
  /**
   * The largest output size. The crop is scaled down to fit, keeping its ratio.
   */
  maxSize?: { width: number; height: number } | undefined
  /**
   * `"circle"` keeps the ellipse inside the crop and leaves the corners transparent
   * @default "rectangle"
   */
  shape?: "rectangle" | "circle" | undefined
  /**
   * The document to create the canvas in
   */
  doc?: Document | undefined
}

function getOutputSize(crop: ImageCrop, maxSize: CropImageOptions["maxSize"]) {
  const width = Math.max(1, Math.round(crop.width))
  const height = Math.max(1, Math.round(crop.height))
  if (!maxSize) return { width, height }
  const scale = Math.min(1, Math.max(1, maxSize.width) / width, Math.max(1, maxSize.height) / height)
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

/**
 * Draws a region of an image onto a new canvas.
 */
export async function cropImageToCanvas(
  source: ImageSource,
  crop: ImageCrop,
  options: CropImageOptions = {},
): Promise<HTMLCanvasElement> {
  if (!(crop.width > 0 && crop.height > 0)) throw new RangeError("[zag-js] A crop needs a width and height above 0")

  const { doc = document, shape = "rectangle", maxSize } = options
  const image = await loadImage(source, { doc })
  const { naturalWidth: width, naturalHeight: height } = image

  const theta = (((crop.rotation ?? 0) % 360) * Math.PI) / 180
  const cos = Math.abs(Math.cos(theta))
  const sin = Math.abs(Math.sin(theta))
  // the size of the image's bounding box once rotated
  const turnedWidth = width * cos + height * sin
  const turnedHeight = width * sin + height * cos

  const size = getOutputSize(crop, maxSize)
  const { canvas, context } = createCanvas(doc, size.width, size.height)
  context.imageSmoothingQuality = "high"

  if (shape === "circle") {
    context.beginPath()
    context.ellipse(size.width / 2, size.height / 2, size.width / 2, size.height / 2, 0, 0, Math.PI * 2)
    context.clip()
  }

  context.scale(size.width / crop.width, size.height / crop.height)
  context.translate(turnedWidth / 2 - crop.x, turnedHeight / 2 - crop.y)
  context.rotate(theta)
  context.scale(crop.flipX ? -1 : 1, crop.flipY ? -1 : 1)
  context.drawImage(image, -width / 2, -height / 2)

  return canvas
}

/**
 * Cuts a region out of an image and encodes it as a new image file.
 *
 * @example
 * const avatar = await cropImage(file, { x: 120, y: 40, width: 600, height: 600 }, {
 *   type: "image/webp",
 *   maxSize: { width: 256, height: 256 },
 *   shape: "circle",
 * })
 */
export async function cropImage(source: ImageSource, crop: ImageCrop, options: CropImageOptions = {}): Promise<Blob> {
  const canvas = await cropImageToCanvas(source, crop, options)
  return canvasToBlob(canvas, options.type, options.quality)
}
