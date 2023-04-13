import { ColorChannel } from "@zag-js/color-utils"
import { getRelativePointPercent } from "@zag-js/dom-event"
import { createScope, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./color-picker.types"

type Point = {
  x: number
  y: number
}

export const dom = createScope({
  getAreaId: (ctx: Ctx) => `color-picker:${ctx.id}:area`,
  getAreaGradientId: (ctx: Ctx) => `color-picker:${ctx.id}:area-gradient`,
  getAreaThumbId: (ctx: Ctx) => `color-picker:${ctx.id}:area-thumb`,
  getChannelSliderTrackId: (ctx: Ctx, channel: ColorChannel) => `color-picker:${ctx.id}:slider-track:${channel}`,
  getChannelInputId: (ctx: Ctx, channel: string) => `color-picker:${ctx.id}:input:${channel}`,
  getContentId: (ctx: Ctx) => `color-picker:${ctx.id}:content`,
  getContentEl: (ctx: Ctx) => dom.queryById(ctx, dom.getContentId(ctx)),

  getAreaEl: (ctx: Ctx) => dom.queryById(ctx, dom.getAreaId(ctx)),
  getAreaValueFromPoint(ctx: Ctx, point: Point) {
    const areaEl = dom.getAreaEl(ctx)
    return getRelativePointPercent(point, areaEl)
  },

  getChannelSliderTrackEl: (ctx: Ctx, channel: ColorChannel) => {
    return dom.queryById(ctx, dom.getChannelSliderTrackId(ctx, channel))
  },
  getChannelSliderValueFromPoint(ctx: Ctx, point: Point, channel: ColorChannel) {
    const areaEl = dom.getChannelSliderTrackEl(ctx, channel)
    return getRelativePointPercent(point, areaEl)
  },
  getChannelInputEls: (ctx: Ctx) => {
    return queryAll<HTMLInputElement>(dom.getContentEl(ctx), "input[data-channel]")
  },
})
