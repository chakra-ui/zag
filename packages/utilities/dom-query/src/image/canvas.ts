/**
 * Creates a canvas and its 2D context. Throws when the size is past the browser's canvas limit.
 */
export function createCanvas(doc: Document, width: number, height: number) {
  const canvas = doc.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  // browsers clamp a canvas past their size limit instead of throwing
  if (!context || canvas.width !== width || canvas.height !== height) {
    throw new RangeError(`[zag-js] A ${width}×${height} canvas is too large`)
  }
  return { canvas, context }
}

/**
 * Encodes a canvas as an image file. Rejects when the browser can't encode it,
 * e.g. when the canvas is tainted by an image from another origin.
 */
export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("[zag-js] The canvas couldn't be encoded"))),
      type,
      quality,
    )
  })
}
