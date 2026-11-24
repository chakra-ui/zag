export type ImageSource = string | Blob | HTMLImageElement

export interface LoadImageOptions {
  /**
   * The CORS mode for a URL from another origin. Without it, the image can't be read back from a canvas.
   * @default "anonymous"
   */
  crossOrigin?: "anonymous" | "use-credentials" | null | undefined
  /**
   * The document to create the image in
   */
  doc?: Document | undefined
}

const LOCAL_URL = /^(data|blob):/

const loadError = () => new Error("[zag-js] The image failed to load")

function whenLoaded(image: HTMLImageElement) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    image.addEventListener("load", () => resolve(image), { once: true })
    image.addEventListener("error", () => reject(loadError()), { once: true })
  })
}

/**
 * Loads an image from a URL, a file or an `<img>` element, and resolves once it can be drawn.
 */
export async function loadImage(source: ImageSource, options: LoadImageOptions = {}): Promise<HTMLImageElement> {
  if (typeof source !== "string" && !(source instanceof Blob)) {
    if (!source.complete) return whenLoaded(source)
    if (!source.naturalWidth) throw loadError()
    return source
  }

  const { crossOrigin = "anonymous", doc = document } = options
  const image = doc.createElement("img")
  const url = typeof source === "string" ? source : URL.createObjectURL(source)
  // only remote URLs need CORS; data and blob URLs are same-origin
  if (typeof source === "string" && crossOrigin && !LOCAL_URL.test(url)) image.crossOrigin = crossOrigin

  const loaded = whenLoaded(image)
  image.src = url
  try {
    return await loaded
  } finally {
    if (typeof source !== "string") URL.revokeObjectURL(url)
  }
}
