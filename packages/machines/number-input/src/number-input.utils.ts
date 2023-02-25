import { isModifiedEvent } from "@zag-js/dom-event"
import { clamp, decrement, formatDecimal, increment } from "@zag-js/number-utils"
import type { JSX } from "@zag-js/types"
import type { MachineContext as Ctx } from "./number-input.types"

export const utils = {
  isValidNumericEvent: (ctx: Ctx, event: JSX.KeyboardEvent) => {
    if (event.key == null) return true
    const isModifier = isModifiedEvent(event)
    const isSingleKey = event.key.length === 1
    if (isModifier || !isSingleKey) return true
    return ctx.validateCharacter?.(event.key) ?? utils.isFloatingPoint(event.key)
  },
  isFloatingPoint: (v: string) => /^[0-9+\-.]$/.test(v),
  sanitize: (ctx: Ctx, value: string) => {
    return value
      .split("")
      .filter(ctx.validateCharacter ?? utils.isFloatingPoint)
      .join("")
  },
  increment: (ctx: Ctx, step?: number) => {
    const value = increment(ctx.value, step ?? ctx.step)
    return formatDecimal(clamp(value, ctx), ctx)
  },
  decrement: (ctx: Ctx, step?: number) => {
    const value = decrement(ctx.value, step ?? ctx.step)
    return formatDecimal(clamp(value, ctx), ctx)
  },
  clamp: (ctx: Ctx) => {
    return formatDecimal(clamp(ctx.value, ctx), ctx)
  },
  parse: (ctx: Ctx, value: string) => {
    return ctx.parse?.(value) ?? value
  },
  format: (ctx: Ctx, value: string | number) => {
    const _val = value.toString()
    return ctx.format?.(_val) ?? _val
  },
  round: (ctx: Ctx) => {
    return formatDecimal(ctx.value, ctx)
  },
}
