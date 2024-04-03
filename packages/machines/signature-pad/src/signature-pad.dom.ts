import { createScope, query } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./signature-pad.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => `signature-${ctx.id}`,
  getControlId: (ctx: Ctx) => `signature-control-${ctx.id}`,
  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getLayerEl: (ctx: Ctx) => query(dom.getControlEl(ctx), "[data-part=layer]"),
  getCanvasEl: (ctx: Ctx) => {
    const myPath = new Path2D(ctx.paths.join(" "))

    const win = dom.getWin(ctx)
    const doc = win.document

    const dpr = win.devicePixelRatio || 1
    const canvasEl = doc.createElement("canvas")

    const svgEl = dom.getLayerEl(ctx)
    if (!svgEl) {
      throw new Error("Could not find the svg element.")
    }

    const rect = svgEl.getBoundingClientRect()
    canvasEl.width = rect.width * dpr
    canvasEl.height = rect.height * dpr

    const render = canvasEl.getContext("2d")
    render?.scale(dpr, dpr)
    render?.fill(myPath)

    return canvasEl
  },
})
