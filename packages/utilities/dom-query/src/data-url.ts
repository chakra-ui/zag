import { getWindow } from "./env"

export type DataUrlType = "image/png" | "image/jpeg" | "image/svg+xml"

export interface DataUrlOptions {
  type: DataUrlType
  quality?: number
}

export function getDataUrl(svg: SVGElement | undefined | null, opts: DataUrlOptions): Promise<string> {
  const { type, quality = 0.92 } = opts

  if (!svg) throw new Error("[get-data-url]: could not find the svg element")

  const win = getWindow(svg)
  const doc = win.document

  const serializer = new win.XMLSerializer()
  const source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svg)
  const svgString = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source)

  if (type === "image/svg+xml") {
    return Promise.resolve(svgString)
  }

  const svgBounds = svg.getBoundingClientRect()
  const dpr = win.devicePixelRatio || 1

  const canvas = doc.createElement("canvas")
  const image = new win.Image()
  image.src = svgString

  canvas.width = svgBounds.width * dpr
  canvas.height = svgBounds.height * dpr

  const context = canvas.getContext("2d")
  context!.scale(dpr, dpr)

  return new Promise((resolve) => {
    image.onload = () => {
      context!.drawImage(image, 0, 0)
      resolve(canvas.toDataURL(type, quality))
    }
  })
}
