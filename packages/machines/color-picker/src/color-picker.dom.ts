import { ColorChannel } from "@zag-js/color-utils"
import { getRelativePointPercent } from "@zag-js/dom-event"
import { createScope } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./color-picker.types"

type Point = {
  x: number
  y: number
}

export const dom = createScope({
  getAreaId: (ctx: Ctx) => `color-picker:${ctx.id}:area`,
  getAreaGradientId: (ctx: Ctx) => `color-picker:${ctx.id}:area-gradient`,
  getAreaThumbId: (ctx: Ctx) => `color-picker:${ctx.id}:area-thumb`,
  getSliderTrackId: (ctx: Ctx, channel: ColorChannel) => `color-picker:${ctx.id}:slider-track:${channel}`,

  getAreaEl: (ctx: Ctx) => dom.queryById(ctx, dom.getAreaId(ctx)),
  getAreaValueFromPoint(ctx: Ctx, point: Point) {
    const areaEl = dom.getAreaEl(ctx)
    return getRelativePointPercent(point, areaEl)
  },

  getSliderTrackEl: (ctx: Ctx, channel: ColorChannel) => {
    return dom.queryById(ctx, dom.getSliderTrackId(ctx, channel))
  },
  getSliderValueFromPoint(ctx: Ctx, point: Point, channel: ColorChannel) {
    const areaEl = dom.getSliderTrackEl(ctx, channel)
    return getRelativePointPercent(point, areaEl)
  },
})
