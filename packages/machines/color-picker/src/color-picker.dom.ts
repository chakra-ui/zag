import type { ColorChannel } from "@zag-js/color-utils"
import { getRelativePoint, type Point } from "@zag-js/dom-event"
import { createScope, queryAll } from "@zag-js/dom-query"
import type { MachineContext as Ctx } from "./color-picker.types"

export const dom = createScope({
  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `color-picker:${ctx.id}`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `color-picker:${ctx.id}:label`,
  getHiddenInputId: (ctx: Ctx) => ctx.ids?.hiddenInput ?? `color-picker:${ctx.id}:hidden-input`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `color-picker:${ctx.id}:control`,
  getTriggerId: (ctx: Ctx) => ctx.ids?.trigger ?? `color-picker:${ctx.id}:trigger`,
  getContentId: (ctx: Ctx) => ctx.ids?.content ?? `color-picker:${ctx.id}:content`,
  getPositionerId: (ctx: Ctx) => ctx.ids?.positioner ?? `color-picker:${ctx.id}:positioner`,
  getFormatSelectId: (ctx: Ctx) => ctx.ids?.formatSelect ?? `color-picker:${ctx.id}:format-select`,

  getAreaId: (ctx: Ctx) => ctx.ids?.area ?? `color-picker:${ctx.id}:area`,
  getAreaGradientId: (ctx: Ctx) => ctx.ids?.areaGradient ?? `color-picker:${ctx.id}:area-gradient`,
  getAreaThumbId: (ctx: Ctx) => ctx.ids?.areaThumb ?? `color-picker:${ctx.id}:area-thumb`,

  getChannelSliderTrackId: (ctx: Ctx, channel: ColorChannel) =>
    ctx.ids?.channelSliderTrack?.(channel) ?? `color-picker:${ctx.id}:slider-track:${channel}`,
  getChannelSliderThumbId: (ctx: Ctx, channel: ColorChannel) =>
    ctx.ids?.channelSliderThumb?.(channel) ?? `color-picker:${ctx.id}:slider-thumb:${channel}`,

  getContentEl: (ctx: Ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getAreaThumbEl: (ctx: Ctx) => dom.getById(ctx, dom.getAreaThumbId(ctx)),
  getChannelSliderThumbEl: (ctx: Ctx, channel: ColorChannel) =>
    dom.getById(ctx, dom.getChannelSliderThumbId(ctx, channel)),
  getChannelInputEl: (ctx: Ctx, channel: string): HTMLInputElement[] => {
    const selector = `input[data-channel="${channel}"]`
    return [
      ...queryAll<HTMLInputElement>(dom.getContentEl(ctx), selector),
      ...queryAll<HTMLInputElement>(dom.getControlEl(ctx), selector),
    ]
  },
  getFormatSelectEl: (ctx: Ctx) => dom.getById<HTMLSelectElement>(ctx, dom.getFormatSelectId(ctx)),

  getHiddenInputEl: (ctx: Ctx) => dom.getById<HTMLInputElement>(ctx, dom.getHiddenInputId(ctx)),
  getAreaEl: (ctx: Ctx) => dom.getById(ctx, dom.getAreaId(ctx)),
  getAreaValueFromPoint(ctx: Ctx, point: Point) {
    const areaEl = dom.getAreaEl(ctx)
    if (!areaEl) return
    const { percent } = getRelativePoint(point, areaEl)
    return percent
  },

  getControlEl: (ctx: Ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getTriggerEl: (ctx: Ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getPositionerEl: (ctx: Ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getChannelSliderTrackEl: (ctx: Ctx, channel: ColorChannel) => {
    return dom.getById(ctx, dom.getChannelSliderTrackId(ctx, channel))
  },
  getChannelSliderValueFromPoint(ctx: Ctx, point: Point, channel: ColorChannel) {
    const trackEl = dom.getChannelSliderTrackEl(ctx, channel)
    if (!trackEl) return
    const { percent } = getRelativePoint(point, trackEl)
    return percent
  },
  getChannelInputEls: (ctx: Ctx) => {
    return [
      ...queryAll<HTMLInputElement>(dom.getContentEl(ctx), "input[data-channel]"),
      ...queryAll<HTMLInputElement>(dom.getControlEl(ctx), "input[data-channel]"),
    ]
  },
})
