import { getWindow } from "../node"
import { createCanvas } from "./canvas"
import { loadImage } from "./load-image"

export type DataUrlType = "image/png" | "image/jpeg" | "image/svg+xml"

export interface DataUrlOptions {
  /**
   * The image type to encode
   */
  type: DataUrlType
  /**
   * The quality from 0 to 1, for JPEG
   * @default 0.92
   */
  quality?: number | undefined
  /**
   * The color drawn behind the SVG. JPEG has no transparency, so it defaults to white there.
   */
  background?: string | undefined
  /**
   * The size to draw at instead of the element's box, like for an SVG that isn't in the document
   */
  size?: { width: number; height: number } | undefined
}

/**
 * Renders an SVG element as a data URL, as SVG or drawn to PNG or JPEG at the device pixel ratio.
 */
export async function svgToDataUrl(svg: SVGSVGElement | undefined | null, options: DataUrlOptions): Promise<string> {
  const { type, quality = 0.92, background, size } = options
  if (!svg) throw new Error("[zag-js > svgToDataUrl]: Could not find the svg element")

  const win = getWindow(svg)
  const bounds = size ?? svg.getBoundingClientRect()

  const clone = svg.cloneNode(true) as SVGSVGElement
  if (!clone.hasAttribute("viewBox")) clone.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`)

  const source = '<?xml version="1.0" standalone="no"?>\r\n' + new win.XMLSerializer().serializeToString(clone)
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source)
  if (type === "image/svg+xml") return svgUrl

  const dpr = win.devicePixelRatio || 1
  const image = await loadImage(svgUrl, { doc: win.document })
  const { canvas, context } = createCanvas(
    win.document,
    Math.max(1, Math.round(bounds.width * dpr)),
    Math.max(1, Math.round(bounds.height * dpr)),
  )

  if (type === "image/jpeg" || background) {
    context.fillStyle = background || "white"
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL(type, quality)
}
