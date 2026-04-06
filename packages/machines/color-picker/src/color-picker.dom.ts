import type { ColorChannel } from "@zag-js/color-utils"
import type { Scope } from "@zag-js/core"
import { getRelativePoint, queryAll } from "@zag-js/dom-query"
import type { Direction, Point } from "@zag-js/types"
import { parts } from "./color-picker.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `${ctx.id}:hidden-input`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `${ctx.id}:control`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `${ctx.id}:trigger`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `${ctx.id}:positioner`
export const getFormatSelectId = (ctx: Scope) => ctx.ids?.formatSelect ?? `${ctx.id}:format-select`
export const getAreaId = (ctx: Scope) => ctx.ids?.area ?? `${ctx.id}:area`
export const getAreaGradientId = (ctx: Scope) => ctx.ids?.areaGradient ?? `${ctx.id}:area-gradient`
export const getAreaThumbId = (ctx: Scope) => ctx.ids?.areaThumb ?? `${ctx.id}:area-thumb`
export const getChannelSliderTrackId = (ctx: Scope, channel: ColorChannel) =>
  ctx.ids?.channelSliderTrack?.(channel) ?? `${ctx.id}:slider-track:${channel}`
export const getChannelSliderThumbId = (ctx: Scope, channel: ColorChannel) =>
  ctx.ids?.channelSliderThumb?.(channel) ?? `${ctx.id}:slider-thumb:${channel}`

export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))
export const getAreaThumbEl = (ctx: Scope) => ctx.query(ctx.selector(parts.areaThumb))
export const getChannelSliderThumbEl = (ctx: Scope, channel: ColorChannel) =>
  ctx.query(`${ctx.selector(parts.channelSliderThumb)}[data-channel="${channel}"]`)
export const getChannelInputEl = (ctx: Scope, channel: string): HTMLInputElement[] => {
  const selector = `input[data-channel="${channel}"]`
  return [
    ...queryAll<HTMLInputElement>(getContentEl(ctx), selector),
    ...queryAll<HTMLInputElement>(getControlEl(ctx), selector),
  ]
}
export const getFormatSelectEl = (ctx: Scope) => ctx.query<HTMLSelectElement>(ctx.selector(parts.formatSelect))
export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))
export const getAreaEl = (ctx: Scope) => ctx.query(ctx.selector(parts.area))
export const getAreaValueFromPoint = (ctx: Scope, point: Point, dir?: Direction) => {
  const areaEl = getAreaEl(ctx)
  if (!areaEl) return
  const { getPercentValue } = getRelativePoint(point, areaEl)
  return {
    x: getPercentValue({ dir, orientation: "horizontal" }),
    y: getPercentValue({ orientation: "vertical" }),
  }
}

export const getControlEl = (ctx: Scope) => ctx.query(ctx.selector(parts.control))
export const getTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.trigger))
export const getPositionerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.positioner))
export const getChannelSliderTrackEl = (ctx: Scope, channel: ColorChannel) =>
  ctx.query(`${ctx.selector(parts.channelSliderTrack)}[data-channel="${channel}"]`)
export const getChannelSliderValueFromPoint = (ctx: Scope, point: Point, channel: ColorChannel, dir?: Direction) => {
  const trackEl = getChannelSliderTrackEl(ctx, channel)
  if (!trackEl) return
  const { getPercentValue } = getRelativePoint(point, trackEl)
  return {
    x: getPercentValue({ dir, orientation: "horizontal" }),
    y: getPercentValue({ orientation: "vertical" }),
  }
}
export const getChannelInputEls = (ctx: Scope) => {
  return [
    ...queryAll<HTMLInputElement>(getContentEl(ctx), "input[data-channel]"),
    ...queryAll<HTMLInputElement>(getControlEl(ctx), "input[data-channel]"),
  ]
}
