import type { ColorChannel } from "@zag-js/color-utils"
import type { Scope } from "@zag-js/core"
import { getRelativePoint, queryAll } from "@zag-js/dom-query"
import type { Point } from "@zag-js/types"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `color-picker:${ctx.id}`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `color-picker:${ctx.id}:label`
export const getHiddenInputId = (ctx: Scope) => ctx.ids?.hiddenInput ?? `color-picker:${ctx.id}:hidden-input`
export const getControlId = (ctx: Scope) => ctx.ids?.control ?? `color-picker:${ctx.id}:control`
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `color-picker:${ctx.id}:trigger`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `color-picker:${ctx.id}:content`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `color-picker:${ctx.id}:positioner`
export const getFormatSelectId = (ctx: Scope) => ctx.ids?.formatSelect ?? `color-picker:${ctx.id}:format-select`
export const getAreaId = (ctx: Scope) => ctx.ids?.area ?? `color-picker:${ctx.id}:area`
export const getAreaGradientId = (ctx: Scope) => ctx.ids?.areaGradient ?? `color-picker:${ctx.id}:area-gradient`
export const getAreaThumbId = (ctx: Scope) => ctx.ids?.areaThumb ?? `color-picker:${ctx.id}:area-thumb`
export const getChannelSliderTrackId = (ctx: Scope, channel: ColorChannel) =>
  ctx.ids?.channelSliderTrack?.(channel) ?? `color-picker:${ctx.id}:slider-track:${channel}`
export const getChannelSliderThumbId = (ctx: Scope, channel: ColorChannel) =>
  ctx.ids?.channelSliderThumb?.(channel) ?? `color-picker:${ctx.id}:slider-thumb:${channel}`

export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getAreaThumbEl = (ctx: Scope) => ctx.getById(getAreaThumbId(ctx))
export const getChannelSliderThumbEl = (ctx: Scope, channel: ColorChannel) =>
  ctx.getById(getChannelSliderThumbId(ctx, channel))
export const getChannelInputEl = (ctx: Scope, channel: string): HTMLInputElement[] => {
  const selector = `input[data-channel="${channel}"]`
  return [
    ...queryAll<HTMLInputElement>(getContentEl(ctx), selector),
    ...queryAll<HTMLInputElement>(getControlEl(ctx), selector),
  ]
}
export const getFormatSelectEl = (ctx: Scope) => ctx.getById<HTMLSelectElement>(getFormatSelectId(ctx))
export const getHiddenInputEl = (ctx: Scope) => ctx.getById<HTMLInputElement>(getHiddenInputId(ctx))
export const getAreaEl = (ctx: Scope) => ctx.getById(getAreaId(ctx))
export const getAreaValueFromPoint = (ctx: Scope, point: Point) => {
  const areaEl = getAreaEl(ctx)
  if (!areaEl) return
  const { percent } = getRelativePoint(point, areaEl)
  return percent
}

export const getControlEl = (ctx: Scope) => ctx.getById(getControlId(ctx))
export const getTriggerEl = (ctx: Scope) => ctx.getById(getTriggerId(ctx))
export const getPositionerEl = (ctx: Scope) => ctx.getById(getPositionerId(ctx))
export const getChannelSliderTrackEl = (ctx: Scope, channel: ColorChannel) =>
  ctx.getById(getChannelSliderTrackId(ctx, channel))
export const getChannelSliderValueFromPoint = (ctx: Scope, point: Point, channel: ColorChannel) => {
  const trackEl = getChannelSliderTrackEl(ctx, channel)
  if (!trackEl) return
  const { percent } = getRelativePoint(point, trackEl)
  return percent
}
export const getChannelInputEls = (ctx: Scope) => {
  return [
    ...queryAll<HTMLInputElement>(getContentEl(ctx), "input[data-channel]"),
    ...queryAll<HTMLInputElement>(getControlEl(ctx), "input[data-channel]"),
  ]
}
