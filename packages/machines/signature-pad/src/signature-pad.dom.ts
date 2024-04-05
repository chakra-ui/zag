import { createScope, query } from "@zag-js/dom-query"
import type { MachineContext as Ctx, DataUrlOptions } from "./signature-pad.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => `signature-${ctx.id}`,
  getControlId: (ctx: Ctx) => `signature-control-${ctx.id}`,

  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getSegmentEl: (ctx: Ctx) => query(dom.getControlEl(ctx), "[data-part=segment]"),

  getDataUrl: (ctx: Ctx, options: DataUrlOptions): Promise<string> => {
    const { type, quality = 0.92 } = options

    if (ctx.isEmpty) {
      return Promise.resolve("")
    }

    const svg = dom.getSegmentEl(ctx) as SVGElement | null
    if (!svg) {
      throw new Error("Could not find the svg element.")
    }

    const win = dom.getWin(ctx)
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
  },
})
