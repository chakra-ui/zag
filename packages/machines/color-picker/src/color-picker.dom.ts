import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./color-picker.types"
import { getRelativePointPercent } from "@zag-js/dom-event"
import { ColorChannel } from "@zag-js/color-utils"

type Point = {
  x: number
  y: number
}

export const dom = createScope({
  getAreaId: (ctx: Ctx) => `color-picker:${ctx.id}:area`,
  getAreaGradientId: (ctx: Ctx) => `color-picker:${ctx.id}:area-gradient`,
  getAreaThumbId: (ctx: Ctx) => `color-picker:${ctx.id}:area-thumb`,
  getSliderTrackId: (ctx: Ctx, channel: ColorChannel) => `color-picker:${ctx.id}:slider-track:${channel}`,

  getAreaEl: (ctx: Ctx) => dom.getById(ctx, dom.getAreaId(ctx)),
  getAreaValueFromPoint(ctx: Ctx, point: Point) {
    const el = dom.getAreaEl(ctx)
    if (!el) return
    const { x, y } = getRelativePointPercent(point, el)
    return { x: x / 100, y: y / 100 }
  },
})
