import { ColorChannel } from "@zag-js/color-utils"
import { getRelativePointPercent } from "@zag-js/dom-event"
import { createScope, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./color-picker.types"

type Point = { x: number; y: number }

export const dom = createScope({
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `color-picker:${ctx.id}:content`,
  getAreaId: (ctx: Ctx) => ctx.ids?.area ?? `color-picker:${ctx.id}:area`,
  getAreaGradientId: (ctx: Ctx) => ctx.ids?.areaGradient ?? `color-picker:${ctx.id}:area-gradient`,
  getAreaThumbId: (ctx: Ctx) => ctx.ids?.areaThumb ?? `color-picker:${ctx.id}:area-thumb`,
  getChannelSliderTrackId: (ctx: Ctx, channel: ColorChannel) =>
    ctx.ids?.channelSliderTrack?.(channel) ?? `color-picker:${ctx.id}:slider-track:${channel}`,
  getChannelInputId: (ctx: Ctx, channel: string) =>
    ctx.ids?.channelInput?.(channel) ?? `color-picker:${ctx.id}:input:${channel}`,
  getChannelSliderThumbId: (ctx: Ctx, channel: ColorChannel) =>
    ctx.ids?.channelSliderThumb?.(channel) ?? `color-picker:${ctx.id}:slider-thumb:${channel}`,

  getContentEl: (ctx: Ctx) => dom.queryById(ctx, dom.getContentId(ctx)),
  getAreaThumbEl: (ctx: Ctx) => dom.queryById(ctx, dom.getAreaThumbId(ctx)),
  getChannelSliderThumbEl: (ctx: Ctx, channel: ColorChannel) =>
    dom.queryById(ctx, dom.getChannelSliderThumbId(ctx, channel)),
  getChannelInputEl: (ctx: Ctx, channel: string) =>
    dom.queryById<HTMLInputElement>(ctx, dom.getChannelInputId(ctx, channel)),

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
