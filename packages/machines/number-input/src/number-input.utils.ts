import { clamp, decrement, increment, roundToPrecision } from "@zag-js/number-utils"
import type { KeyboardEvent } from "react"
import { MachineContext as Ctx } from "./number-input.types"

export const utils = {
  isValidNumericEvent: (ctx: Ctx, event: KeyboardEvent) => {
    if (event.key == null) return true
    const isModifierKey = event.ctrlKey || event.altKey || event.metaKey
    const isSingleCharacterKey = event.key.length === 1
    if (isModifierKey || !isSingleCharacterKey) return true
    return ctx.validateCharacter?.(event.key) ?? utils.isFloatingPoint(event.key)
  },
  isFloatingPoint: (v: string) => /^[Ee0-9+\-.]$/.test(v),
  sanitize: (ctx: Ctx, value: string) => {
    return value
      .split("")
      .filter(ctx.validateCharacter ?? utils.isFloatingPoint)
      .join("")
  },
  increment: (ctx: Ctx, step?: number) => {
    let value: string | number = increment(ctx.value, step ?? ctx.step)
    value = clamp(value, ctx)
    return roundToPrecision(value, ctx)
  },
  decrement: (ctx: Ctx, step?: number) => {
    let value: string | number = decrement(ctx.value, step ?? ctx.step)
    value = clamp(value, ctx)
    return roundToPrecision(value, ctx)
  },
  clamp: (ctx: Ctx) => {
    let value: string | number = clamp(ctx.value, ctx)
    return roundToPrecision(value, ctx)
  },
  parse: (ctx: Ctx, value: string) => {
    return ctx.parse?.(value) ?? value
  },
  format: (ctx: Ctx, value: string | number) => {
    const _val = value.toString()
    return ctx.format?.(_val) ?? _val
  },
  round: (ctx: Ctx) => {
    return roundToPrecision(ctx.value, ctx)
  },
}
